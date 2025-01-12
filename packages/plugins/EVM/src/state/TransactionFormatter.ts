import * as ABICoder from 'web3-eth-abi'
import type { Plugin } from '@masknet/plugin-infra'
import {
    isZero,
    isSameAddress,
    TransactionContext,
    TransactionDescriptor as TransactionDescriptorBase,
    TransactionDescriptorType,
} from '@masknet/web3-shared-base'
import { TransactionFormatterState } from '@masknet/plugin-infra/web3'
import {
    ChainId,
    getData,
    getFunctionParameters,
    getFunctionSignature,
    getTo,
    isEmptyHex,
    isZeroAddress,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-evm'
import { readABIs } from './TransactionFormatter/abi'
import { createConnection } from './Connection/connection'
import type { TransactionDescriptor } from './TransactionFormatter/types'

// built-in descriptors
import { TransferTokenDescriptor } from './TransactionFormatter/descriptors/TransferToken'
import { ContractDeploymentDescriptor } from './TransactionFormatter/descriptors/ContractDeployment'
import { CancelDescriptor } from './TransactionFormatter/descriptors/Cancel'
import { BaseTransactionDescriptor } from './TransactionFormatter/descriptors/Base'
import { ITODescriptor } from './TransactionFormatter/descriptors/ITO'
import { MaskBoxDescriptor } from './TransactionFormatter/descriptors/MaskBox'
import { RedPacketDescriptor } from './TransactionFormatter/descriptors/RedPacket'
import { ERC20Descriptor } from './TransactionFormatter/descriptors/ERC20'
import { ERC721Descriptor } from './TransactionFormatter/descriptors/ERC721'
import { SwapDescriptor } from './TransactionFormatter/descriptors/Swap'

export class TransactionFormatter extends TransactionFormatterState<ChainId, TransactionParameter, Transaction> {
    private coder = ABICoder as unknown as ABICoder.AbiCoder
    private connection = createConnection()
    private descriptors: Record<TransactionDescriptorType, TransactionDescriptor[]> = {
        [TransactionDescriptorType.TRANSFER]: [new TransferTokenDescriptor()],
        [TransactionDescriptorType.INTERACTION]: [
            new ITODescriptor(),
            new MaskBoxDescriptor(),
            new RedPacketDescriptor(),
            new ERC20Descriptor(),
            new ERC721Descriptor(),
            new SwapDescriptor(),
            new BaseTransactionDescriptor(),
        ],
        [TransactionDescriptorType.DEPLOYMENT]: [new ContractDeploymentDescriptor()],
        [TransactionDescriptorType.RETRY]: [],
        [TransactionDescriptorType.CANCEL]: [new CancelDescriptor()],
    }

    constructor(context: Plugin.Shared.SharedContext) {
        super(context)
    }

    override async createContext(
        chainId: ChainId,
        transaction: Transaction,
        hash?: string,
    ): Promise<TransactionContext<ChainId, string | undefined>> {
        const from = (transaction.from as string | undefined) ?? ''
        const value = (transaction.value as string | undefined) ?? '0x0'
        const data = getData(transaction)
        const to = getTo(transaction)
        const signature = getFunctionSignature(transaction)
        const parameters = getFunctionParameters(transaction)

        const context = {
            chainId,
            from,
            to,
            value,
            hash,
        }

        if (data) {
            // contract interaction
            const abis = readABIs(signature)

            if (abis?.length) {
                try {
                    return {
                        ...context,
                        type: TransactionDescriptorType.INTERACTION,
                        methods: abis.map((x) => ({
                            name: x.name,
                            parameters: this.coder.decodeParameters(x.parameters, parameters ?? ''),
                        })),
                    }
                } catch {
                    // do nothing
                }
            }

            // contract deployment
            if (isZeroAddress(to)) {
                return {
                    ...context,
                    type: TransactionDescriptorType.DEPLOYMENT,
                    code: data,
                }
            }
        }

        if (to) {
            let code = ''
            try {
                code = await this.connection.getCode(to, { chainId })
            } catch {
                code = ''
            }

            // cancel tx
            if (isSameAddress(from, to) && isZero(value)) {
                return { ...context, type: TransactionDescriptorType.CANCEL }
            }

            // send ether
            if (isEmptyHex(code)) {
                return { ...context, type: TransactionDescriptorType.TRANSFER }
            } else {
                return { ...context, type: TransactionDescriptorType.INTERACTION }
            }
        }

        throw new Error('Failed to format transaction.')
    }

    override async createDescriptor(
        chainId: ChainId,
        transaction: Transaction,
        context: TransactionContext<ChainId, TransactionParameter>,
    ): Promise<TransactionDescriptorBase<ChainId, Transaction>> {
        for (const descriptor of this.descriptors[context.type]) {
            const computed = await descriptor.compute(context)

            if (computed)
                return {
                    ...computed,
                    chainId,
                    type: context.type,
                    _tx: transaction,
                }
        }

        throw new Error('Failed to computed transaction descriptor.')
    }
}
