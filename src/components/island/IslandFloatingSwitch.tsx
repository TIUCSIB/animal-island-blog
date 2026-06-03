import { useState } from 'react'
import { Switch } from 'animal-island-ui'

import './island.css'

export interface IslandFloatingSwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  checkedLabel?: string
  uncheckedLabel?: string
  checkedChildren?: React.ReactNode
  unCheckedChildren?: React.ReactNode
  className?: string
  onChange?: (checked: boolean) => void
}

export function IslandFloatingSwitch({
  checked,
  defaultChecked = false,
  checkedLabel = '已开启',
  uncheckedLabel = '已关闭',
  checkedChildren = 'ON',
  unCheckedChildren = 'OFF',
  className,
  onChange,
}: IslandFloatingSwitchProps) {
  const [innerChecked, setInnerChecked] = useState(defaultChecked)
  const isControlled = checked !== undefined
  const currentChecked = isControlled ? checked : innerChecked

  function handleChange(nextChecked: boolean) {
    if (!isControlled) {
      setInnerChecked(nextChecked)
    }

    onChange?.(nextChecked)
  }

  return (
    <div className={['island-floating-switch', currentChecked && 'island-floating-switch--checked', className].filter(Boolean).join(' ')} onClick={() => handleChange(!currentChecked)}>
      <span className="island-floating-switch__label">{currentChecked ? checkedLabel : uncheckedLabel}</span>
      <span className="island-floating-switch__control" onClick={(event) => event.stopPropagation()}>
        <Switch size="small" checked={currentChecked} checkedChildren={checkedChildren} unCheckedChildren={unCheckedChildren} onChange={handleChange} />
      </span>
    </div>
  )
}
