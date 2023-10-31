function parseGameData(gameId) {
    document.getElementById('score-container').innerHTML = '';  
    document.getElementById('scoring-plays-container').innerHTML = '';
    document.getElementById('win-probability-container').innerHTML = '';
    document.getElementById('0').innerHTML = '';
    document.getElementById('1').innerHTML = '';
    var apiURL = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`;
    fetch(apiURL)
    .then(response => response.json())
    .then(data => {
        const away_team = data.boxscore.teams[0].team.displayName;
        const home_team = data.boxscore.teams[1].team.displayName;
        // ============== BOX SCORE ============= //

        const game_status = data.header.competitions[0].status.type.state; // "pre" "in" "post"

        const date = new Date(data.header.competitions[0].date);
        let formattedTime;
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
            formattedTime = date.toLocaleDateString('en-US', options);
        if (data.header.timeValid) {
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const period = hours >= 12 ? 'p.m.' : 'a.m.';
            const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
            formattedTime += `<br>${formattedHours}:${formattedMinutes} ${period}`;
        }

        if (game_status === "pre") {
            var box_score_html = `
                <div id="scoreboard">
                        <div style="flex: 30%;">
                            <h4>&nbsp;</h4>
                            <h6>${away_team}</h6>
                        </div>
                        <div style="flex: 30%;">
                            <h6><b>${data.gameInfo.venue.fullName}</b></h6>
                            <h6>${formattedTime}</h6>
                        </div>
                        <div style="flex: 30%;">
                            <h4>&nbsp;</h4>
                            <h6>${home_team}</h6>
                        </div>
                </div>
            `;
            document.getElementById('score-container').innerHTML += box_score_html;
        } else {
            const away_score = data.header.competitions[0].competitors[1].score;
            const home_score = data.header.competitions[0].competitors[0].score;

            const away_abbrev = data.header.competitions[0].competitors[1].team.abbreviation;
            const home_abbrev = data.header.competitions[0].competitors[0].team.abbreviation;

            const display_clock = data.header.competitions[0].status.type.shortDetail;

            var display_clock_color = display_clock === "Final" || "Final/OT" ? "black" : "#900";

            var box_score_html = `
                <div id="scoreboard">
                        <div style="flex: 20%;">
                            <h4>${away_score}</h4>
                            <h6>${away_team}</h6>
                        </div>
                        <div style="flex: 50%;">
                            <h6 style="color: ${display_clock_color}; margin-top: 0"><b>${display_clock}</b></h6>
                            <table id="linescore-table">
                                <tr>
                                    <th></th>
                                    <th><h6><b>Q1</b></h6></th>
                                    <th><h6><b>Q2</b></h6></th>
                                    <th><h6><b>Q3</b></h6></th>
                                    <th><h6><b>Q4</b></h6></th>
                                </tr>
                                <tr id="linescores-away">
                                    <td class="linescores-team-name"><h6>${away_abbrev}</h6></td>
                                </tr>
                                <tr id="linescores-home">
                                    <td class="linescores-team-name"><h6>${home_abbrev}</h6></td>
                                </tr>
                            </table>
                        </div>
                        <div style="flex: 20%;">
                            <h4>${home_score}</h4>
                            <h6>${home_team}</h6>
                        </div>
                </div>
            `;

            document.getElementById('score-container').innerHTML += box_score_html;

            for (let linescore of data.header.competitions[0].competitors[0].linescores) {
                document.getElementById('linescores-away').innerHTML += `<td><h6>${linescore.displayValue}</h6></td>`;
            }
            for (let linescore of data.header.competitions[0].competitors[1].linescores) {
                document.getElementById('linescores-home').innerHTML += `<td><h6>${linescore.displayValue}</h6></td>`;
            }

        }

        //================= SCORING PLAYS =================//
        const scoring_plays = data.plays.filter(play => play.scoringPlay).slice(-5);

        let scoring_plays_html = '';
        for (i = scoring_plays.length - 1; i >= 0; i--) {
            const play = scoring_plays[i];
            const scoring_description = play.text;
            const scoring_time = play.clock.displayValue;
            const scoring_period = play.period.displayValue;
            const pbp_away_score = play.awayScore;
            const pbp_home_score = play.homeScore;

            scoring_plays_html += `
                <li class="scoring-play">
                    <h4 style="margin-bottom: 5px;">${scoring_description}</h4>
                    <h6 style="margin-top: 0;">${scoring_time} ${scoring_period} | ${pbp_away_score} - ${pbp_home_score}</h6>
                </li>
            `;
        }

        document.getElementById('scoring-plays-container').innerHTML = scoring_plays_html;

        //================= WIN PROBABILITY =================//
        if (data.winprobability) {
            const win_p = data.winprobability;
            const home_win_p = win_p[win_p.length - 1].homeWinPercentage;
            const home_win_p_previous = win_p[win_p.length - 2].homeWinPercentage;
            
            let display_win_p;
            let display_change;
            let display_team;
            if (home_win_p >= 0.5) {
                display_win_p = (home_win_p * 100).toFixed(1);
                display_change = ((home_win_p - home_win_p_previous) * 100).toFixed(1);
                display_team = home_team;
            } else {
                display_win_p = ((1 - home_win_p) * 100).toFixed(1);
                display_change = ((home_win_p_previous - home_win_p) * 100).toFixed(1);
                display_team = away_team;
            }

            let display_change_color;
            if (display_change > 0) {
                display_change_color = 'green';
            } else if (display_change < 0) {
                display_change_color = 'red';
            } else {
                display_change_color = 'black';
            }

            const win_p_container = document.getElementById('win-probability-container');
            win_p_container.innerHTML += `
                <h4 style="margin-top: 20px;" class="percentage">${display_win_p}% <span style="color: ${display_change_color}; font-size: 12px;">${display_change > 0 ? '+' : ''}${display_change}%</h4>
                <h6 style="margin-top: 0px;">${display_team}</h6>
            `;
        // IF GAME HASN'T STARTED, USE MATCHUP PREDICTOR
        } else {
            const home_win_p = data.predictor.awayTeam.gameProjection;
            const away_win_p = data.predictor.homeTeam.teamChanceLoss;

            let display_win_p;
            let display_change;
            let display_team;
            if (home_win_p >= 0.5) {
                display_win_p = home_win_p;
                display_team = home_team;
            } else {
                display_win_p = away_win_p;
                display_team = away_team;
            }

            const win_p_container = document.getElementById('win-probability-container');
            win_p_container.innerHTML += `
                <h4 class="percentage">${display_win_p}%</h4>
                <h6 style="margin-top: 0px;">${display_team}</h6>
            `;
        }
        

        // ============== GAME LEADERS ============= //
        const leadersData = data.leaders;
    
        var i = 0;
        
        // data.leaders[0], [1]    
        for (let xteam of leadersData) {
            
            document.getElementById(i).innerHTML += `<h6>${xteam.team.displayName}</h6>`;
            
            for (let xstat of xteam.leaders) {
                    
                const xathlete = xstat.leaders[0].athlete;
                
                if (i == 0) {
                document.getElementById(i).innerHTML += `
                <h4> </h4>
                <h4 style="font-size:20px;">${xstat.leaders[0].displayValue}</h4>
                <h6><b> ${xathlete.jersey} ${xathlete.shortName} (${xathlete.position.abbreviation})</b></h6>
                
                `
                } else {
                    document.getElementById(i).innerHTML += `
                    <h4>${xstat.displayName.toLowerCase()}</h4>
                    <h4 style="font-size:20px;">${xstat.leaders[0].displayValue}</h4>
                    <h6><b> ${xathlete.jersey} ${xathlete.shortName} (${xathlete.position.abbreviation})</b></h6>
                    `;    
                }
                
            }
            
            if (i == 1) { break; }
            
            i += 1;
            
        }

    });
}

    function getScoreboardData() {

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const yyyy_mm_dd = `${year}${month}${day}`;
        
        return fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard`)
        .then((response) => { 
            return response.json().then((data) => {
                console.log(data);
                return data;
            }).catch((err) => {
                console.log(err);
            }) 
        });
    }

    function callGame(num) {
        getScoreboardData().then((data) => {
            let jsonData;
            jsonData = data;
            console.log(jsonData);
            const games = jsonData.events;
            parseGameData(games[num].id)
        });
    }
    

    function displayGameList() {
        let jsonData;
        getScoreboardData().then((data) => {
            jsonData = data;
            console.log(jsonData);
            const games = jsonData.events;
            for (let i = games.length - 1; i >= 0; i--) {
                const score_data = games[i].competitions[0];

                const home_abbrev = score_data.competitors[0].team.abbreviation;
                const away_abbrev = score_data.competitors[1].team.abbreviation;

                const home_logo = score_data.competitors[0].team.logo;
                const away_logo = score_data.competitors[1].team.logo;

                const home_score = score_data.competitors[0].score;
                const away_score = score_data.competitors[1].score;

                const home_win = score_data.competitors[0].winner;

                let home_color;
                let home_background;
                let away_color;
                let away_background;
                

                if (home_win) {
                    home_background = '#900';
                    home_color = 'white';

                    away_color = 'black';
                    away_background = 'transparent';
                } else {
                    home_color = 'black';
                    home_background = 'transparent';

                    away_color = 'white';
                    away_background = '#900';
                }

                const game_status_detail = score_data.status.type.shortDetail; // "1st Quarter" "Final" "Halftime"

                let game_status_detail_color;
                if (game_status_detail === "Final" || game_status_detail === "Final/OT") {
                    game_status_detail_color = 'black';
                } else {
                    game_status_detail_color = '#900';
                }
                

                var gameDisplayHtml = `
                    <table class="game-display" id="game-display-${i}" onclick="callGame(${i})" style="cursor: pointer;">
                        <tr>
                            <td><h6 style="color:${game_status_detail_color}">${game_status_detail}</h6></td>
                        </tr>
                        <tr id="away-row" style="background-color: ${away_background}">
                            <td class="logo"><img src="${away_logo}" style="width: 50px; height: 50px;"></td>
                            <td style="padding-left: 10px;"><h4 style="text-align: right; color: ${away_color}">${away_abbrev}</h4></td>
                            <td style="padding-left: 10px;"><h4 style="font-size: 20px; color: ${away_color}">${away_score}</h4></td>
                        </tr>
                        <tr id="home-row" style="background-color: ${home_background}">
                            <td class="logo"><img src="${home_logo}" style="width: 50px; height: 50px;"></td>
                            <td style="padding-left: 10px;"><h4 style="text-align: right; color: ${home_color}">${home_abbrev}</h4></td>
                            <td style="padding-left: 10px;"><h4 style="font-size: 20px; color: ${home_color}">${home_score}</h4></td>
                        </tr>
                    </table>
                `;

                document.getElementById('game-list').innerHTML += gameDisplayHtml + `<hr>`;
            }
        });
    }

