import React, { InputHTMLAttributes } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
export interface DropDownProps extends InputHTMLAttributes<HTMLSelectElement> {
  className?: string
  options?: OptionsData[]
  error?: 'string'
  isgrouped?: boolean
  groupOptionData?: any
  selectlabel?: string
}
interface OptionsData {
  value: string
  label: string
  disabled?: boolean
}
const getGroupedValue = (options, value) => {
  let groupedValue = ''
  Object.keys(options).forEach((group) => {
    options[group].forEach((option) => {
      if (option.value === value) {
        groupedValue = option
      }
    })
  })
  return groupedValue
}
const getValue = (options, value, isgrouped) => {
  const filteredValue = isgrouped
    ? getGroupedValue(options, value)
    : options.find((option) => option.value == value)
  return filteredValue ? filteredValue.label : ''
}
// filter data based on filter text in simple and grouped dropdown
const filterData = (options, filterText) => {
  if (filterText) {
    return options.filter((option) =>
      option.label.toLowerCase().includes(filterText.toLowerCase())
    )
  }
  return options
}

// filter data based on filter text in grouped dropdown
const filterGroupedData = (options, filterText) => {
  if (filterText) {
    return Object.keys(options).reduce((acc, group) => {
      acc[group] = options[group].filter((option) =>
        option.label.toLowerCase().includes(filterText.toLowerCase())
      )
      return acc
    }, {})
  }
  return options
}
export const PixelDropDown = React.forwardRef<HTMLSelectElement, DropDownProps>(
  (
    {
      className,
      options = [],
      error,
      groupOptionData = {},
      isgrouped = false,
      selectlabel = 'Please select',
      value = '',
      onChange,
      ...rest
    },
    ref
  ) => {
    const [isOptionsOpen, setIsOptionsOpen] = React.useState(false)
    const [filterText, setFilterText] = React.useState('')
    const [position, setPosition] = React.useState({})
    const toggleOptions = () => {
      setIsOptionsOpen(!isOptionsOpen)
      handleMouseMove()
    }
    const toggleRef = React.useRef(null)
    const handleMouseMove = () => {
      //  change tooltip.current position only if it's out of the screen document.body
      if (toggleRef?.current) {
        setPosition(toggleRef?.current.getBoundingClientRect())
        // const tooltipRect = toggleRef?.current.getBoundingClientRect()
        // const bodyRect =
        //   toggleRef?.current.parentElement.getBoundingClientRect()

        // if (tooltipRect.top < bodyRect.top) {
        //   setPosition('bottom')
        // }
        // if (tooltipRect.bottom > bodyRect.bottom) {
        //   setPosition('top')
        // }
      }
    }
    React.useEffect(() => {
      window.addEventListener('scroll', handleMouseMove)
      return () => {
        window.removeEventListener('scroll', handleMouseMove)
      }
    }, [])

    const groupData = filterGroupedData(groupOptionData, filterText)
    return (
      <DropDown ref={toggleRef} {...rest} className={className}>
        <Toggler onClick={toggleOptions}>
          <OptionLabel>
            {getValue(
              isgrouped ? groupOptionData : options,
              value,
              isgrouped
            ) || selectlabel}
          </OptionLabel>
          <FontAwesomeIcon icon={faAngleDown} />
        </Toggler>
        {isOptionsOpen && (
          <React.Fragment>
            {isgrouped ? (
              <React.Fragment>
                <DropDownList position={position}>
                  <SearchPixelInput>
                    <Search
                      placeholder='Search'
                      name='search'
                      onChange={(e) => setFilterText(e.target.value)}
                      value={filterText}
                    />
                  </SearchPixelInput>
                  {Object.keys(groupData).map((key) => {
                    if (groupData[key].length == 0) return null

                    return (
                      <OptGroup label={key}>
                        {groupData[key].map((option) => {
                          return (
                            <Option
                              onClick={() => {
                                onChange &&
                                  onChange({
                                    target: { value: option.value }
                                  })
                                setIsOptionsOpen(false)
                              }}
                              key={option.value}
                              value={option.value}
                              disabled={option.disabled}
                              className={
                                option.value === value ? 'selected' : ''
                              }
                            >
                              {option.label}
                            </Option>
                          )
                        })}
                      </OptGroup>
                    )
                  })}
                </DropDownList>
              </React.Fragment>
            ) : (
              <React.Fragment>
                {' '}
                <DropDownList position={position}>
                  <SearchPixelInput>
                    <Search
                      placeholder='Search'
                      name='search'
                      onChange={(e) => setFilterText(e.target.value)}
                      value={filterText}
                    />
                  </SearchPixelInput>
                  {filterData(options, filterText)?.map((option) => {
                    return (
                      <Option
                        key={option.value}
                        className={option.value === value ? 'selected' : ''}
                        value={option.value}
                        disabled={option.disabled}
                        onClick={() => {
                          onChange &&
                            onChange({ target: { value: option.value } })
                          setIsOptionsOpen(false)
                        }}
                      >
                        {option.label}
                      </Option>
                    )
                  })}
                </DropDownList>
              </React.Fragment>
            )}
          </React.Fragment>
        )}
      </DropDown>
    )
  }
)
const Toggler = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
`
const DropDown = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  cursor: pointer;
  &:last-child {
    margin-bottom: 0;
  }
`
const OptionLabel = styled.div``
const DropDownList = styled.div`
  background-color: #fff;
  border: 1px solid #ced4da;
  border-top: none;
  width: ${(props) => props.position.width}px;
  min-width: 300px;
  max-height: 300px;
  overflow: auto;
  padding-top: 60px;
  position: fixed;
  top: ${(props) => props.position.top + props.position.height}px;
  left: ${(props) => props.position.left}px;
  z-index: 99;
`
const Option = styled.option`
  background-color: #ffffff;
  height: 40px;
  padding: 5px 5px 5px 25px;
  cursor: pointer;
  &:hover {
    background-color: #f0f4fa;
  }
  &.selected {
    background-color: #136acd;
    color: #ffffff;
  }
`
const OptGroup = styled.optgroup`
  width: 100%;
  border-top: 1px solid #ced4da;
  // border-bottom: 1px solid #ced4da;
  padding: 0.5rem 1rem;
`
const SearchPixelInput = styled.div`
  padding: 0.5rem 1rem;
  box-sizeing: border-box;
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
`
const Search = styled.input`
  background-color: #ffffff; !important;
  width: 100%;
  border: 1px solid #ced4da;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  box-sizeing: border-box;
  
  &:focus, &:active, &:focus-visible {
   
    outline: none;
  }
`
export default PixelDropDown