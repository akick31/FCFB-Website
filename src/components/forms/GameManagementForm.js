import React, { useState } from 'react';

const GameManagementForm = () =>{
    const [formData, setFormData] = useState({
        homeTeam: '',
        awayTeam: '',
        location: '',
        scrimmage: false,
        subdivision: '',
        week: '',
        tvChannel: '',
        season: '',
        startTime: '',
        command: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setFormData({ ...formData, command: formData.homeTeam + " " + formData.awayTeam });
    };

    return (
        <div className="form-container">
            <h2 className="form-title">Game Management</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <div className="form-group">
                        <label className="form-label">Home Team</label>
                        <input type="text" name="location" value={formData.homeTeam} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Away Team</label>
                        <input type="text" name="awayTeam" value={formData.awayTeam} onChange={handleChange} className="form-input" />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Test</label>
                    <input type="text" id="city" name="city" list="citynames" className="form-input"/>
                    <WeekList />
                </div>  
                <div className="form-group">
                    <label className="form-label">Subdivision</label>
                    <select id="subdivision" name="subdivision" value={formData.subdivision} onChange={handleChange} className="form-input">
                        <option value="FBS">FBS</option>
                        <option value="FCS">FCS</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="inline-form-label">Scrimmage?</label>
                    <input type="checkbox"  value={formData.scrimmage} onChange={handleChange}/>
                </div>
                <button type="submit" className="form-btn">Create command</button>
                {formData.command && <p className="error-message">{formData.command}</p>}
            </form>
        </div>
    );
};

export default GameManagementForm;

const WeekList = () =>{
    return (
        <datalist id="citynames">
            <option value="New York" />
            <option value="Los Angeles" />
            <option value="Chicago" />
        </datalist>
    );
};