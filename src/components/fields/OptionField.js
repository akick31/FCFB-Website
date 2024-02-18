import { React } from 'react';

const OptionField = (props) =>{
    var binding = props.binding;
    var optionList = props.options;
    var changeHandler = props.changeHandler;
    var name = props.name;

    return (
        <>
            <select id="weekList" name={name} value={binding} onChange={changeHandler} className="form-input">
                {optionList.map((item) =>{
                    return(
                        <option value={item}>{item}</option>
                    );
                })}
            </select>
        </>
    );
}

export default OptionField;