import type { ChangeEvent } from 'react'
import { Services } from '../../../API'
import { useAncientPostsCompatibilityMode } from '../api'
import SettingSwitch from './SettingSwitch'
import { memo, useCallback } from 'react'

const AncientPostsSetting = memo(() => {
    const checked = useAncientPostsCompatibilityMode()

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        Services.Settings.setAncientPostsCompatibiltyMode(event.target.checked)
    }, [])

    return <SettingSwitch checked={checked} onChange={handleChange}></SettingSwitch>
})

export default AncientPostsSetting
