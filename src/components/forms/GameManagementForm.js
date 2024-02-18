import React, { useState } from 'react';

const GameManagementForm = () =>{
    const [formData, setFormData] = useState({
        homeTeam: '',
        homeTeamPlatform: '',
        awayTeam: '',
        awayTeamPlatform: '',
        location: '',
        scrimmage: false,
        subdivision: '',
        week: '1',
        tvChannel: '',
        season: '1',
        startTime: '',
        command: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        var formatCommand = formatForCommand(formData);

        setFormData({ ...formData, command: formatCommand });
    };

    return (
        <div className="form-container">
            <h2 className="form-title">Game Management</h2>
            <form onSubmit={handleSubmit}>
                <SeasonWeekSelection weekSelection={formData.week} seasonSelection={formData.season} changeHandler={handleChange}/>
                <TeamSelection groupTitle="Home Team" teamName={formData.homeTeam} teamPlatform={formData.homeTeamPlatform} homeTeam={true} changeHandler={handleChange}/>
                <TeamSelection teamName={formData.awayTeam} teamPlatform={formData.awayTeamPlatform} changeHandler={handleChange}/>
                <Location value={formData.location} changeHandler={handleChange}/>
                <Subdivison value={formData.subdivision} changeHandler={handleChange}/>
                <TVChannel value={formData.tvChannel} changeHandler={handleChange}/>
                <Scrimmage value={formData.scrimmage} changeHandler={handleChange}/>
                <button type="submit" className="form-btn">Create command</button>
                {formData.command && <p className="error-message">{formData.command}</p>}
            </form>
        </div>
    );
};

export default GameManagementForm;

//#region Elements
function TeamSelection(props){
    var teamName = props.teamName;
    var teamPlatform = props.teamPlatform;
    var homeTeam = props.homeTeam ?? false;
    var changeHandler = props.changeHandler;

    const platforms = ["Reddit", "Discord"];

    return (
        <>
            <div style={{display: "flex"}}>
                <div className="form-group">
                    <label className="form-label">{homeTeam ? "Home Team" : "Away Team"}</label>
                    <input type="text" name={homeTeam ? "homeTeam" : "awayTeam"} value={teamName} onChange={changeHandler} className="form-input" />
                </div>
                <div className="form-group">
                    <label className="form-label">{homeTeam ? "Home Team Platform" : "Away Team Platform"}</label>
                    <select name={homeTeam ? "homeTeamPlatform" : "awayTeamPlatform"} value={teamPlatform} onChange={changeHandler} className="form-input">
                        {platforms.map((item) =>{
                            return(
                                <option value={item}>{item}</option>
                            );
                        })}
                    </select>
                </div>
            </div>
        </>
    );
}

function SeasonWeekSelection(props){
    var weekSelection = props.weekSelection;
    var seasonSelection = props.seasonSelection;
    var changeHandler = props.changeHandler;
    var weekList = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "CCG", "Postseason"];
    var seasonList = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

    return (
        <div style={{display: "flex"}}>
            <div className="form-group">
                <label className="form-label">Season</label>
                <select id="season" name="season" value={seasonSelection} onChange={changeHandler} className="form-input">
                    {seasonList.map((item) =>{
                        return(
                            <option value={item}>{item}</option>
                        );
                    })}
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Week</label>
                <select id="weekList" name="week" value={weekSelection} onChange={changeHandler} className="form-input">
                    {weekList.map((item) =>{
                        return(
                            <option value={item}>{item}</option>
                        );
                    })}
                </select>
            </div>
        </div>
    );
}

function Location(props){
    var value = props.value;
    var changeHandler = props.changeHandler;

    return(
        <div className="form-group">
            <label className="form-label">Location</label>
            <input id="location" name="location" value={value} onChange={changeHandler} className="form-input"/>
        </div>
    );
}

function Subdivison(props) {
    var value = props.value;
    var changeHandler = props.changeHandler;

    var divisions = ["FBS", "FCS"];

    return (
        <div className="form-group">
            <label className="form-label">Subdivision</label>
            <select id="subdivision" name="subdivision" value={value} onChange={changeHandler} className="form-input">
                {divisions.map((item) =>{
                    return(
                        <option value={item}>{item}</option>
                    );
                })}
            </select>
        </div>
    );
};

function TVChannel(props) {
    var value = props.value;
    var changeHandler = props.changeHandler;
    var tvChannels = ["ESPN", "ESPN2", "ABC", "NBC", "CBS"];

    return (
        <div className="form-group">
        <label className="form-label">TV Channel</label>
        <select id="tvChannelInput" name="tvChannel" value={value} onChange={changeHandler} className="form-input">
            {tvChannels.map((item) =>{
                return(
                    <option value={item}>{item}</option>
                );
            })}
        </select>
    </div>
    )
}

function Scrimmage(props){
    var scrimmage = props.value;
    var changeHandler = props.changeHandler;

    return (
        <div className="form-group">
            <label className="inline-form-label">Scrimmage?</label>
            <input type="checkbox"  value={scrimmage} onChange={changeHandler}/>
        </div>
    );
};
//#endregion Elements

//#region Helper Functions
function formatForCommand(formData){
    var formattedData = "";
    formattedData += "Home team: " + formData.homeTeam + "\n";
    formattedData += "Away team: " + formData.awayTeam + "\n";
    return formattedData;
}
//#endregion Helper Functions