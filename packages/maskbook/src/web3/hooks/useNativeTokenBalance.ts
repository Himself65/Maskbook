import { useAccount } from './useAccount'
import { useAsyncRetry } from 'react-use'
import { useBlockNumber } from './useBlockNumber'
import Services from '../../extension/service'
import { useChainId } from './useChainId'

/**
 * Fetch native token balance from chain
 * @param address
 */
export function useNativeTokenBalance(address: string) {
    const account = useAccount()
    const chainId = useChainId()
    const blockNumber = useBlockNumber(chainId)
    return useAsyncRetry(async () => {
        if (!account || !address) return undefined
        return Services.Ethereum.getBalance(account)
    }, [account, blockNumber, chainId, address])
}
