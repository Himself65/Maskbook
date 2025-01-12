import { Alert as MuiAlert } from '@mui/material'
import { noop } from 'lodash-unified'
import { MuiArgs, story } from '../utils'

const { meta, of } = story(MuiAlert)

export default meta({
    title: 'Atoms/Alert',
    argTypes: MuiArgs.alert,
})

export const Alert = of({
    args: {
        severity: 'error',
        children: 'Info message',
        onClose: noop,
    },
})
