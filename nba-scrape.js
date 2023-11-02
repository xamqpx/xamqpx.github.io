function parseGameData(gameId) {
    document.getElementById('score-container').innerHTML = '';  
    document.getElementById('scoring-plays-container').innerHTML = '';
    document.getElementById('win-probability-container').innerHTML = '';
    document.getElementById('points-container').innerHTML = '';
    document.getElementById('assists-container').innerHTML = '';
    document.getElementById('rebounds-container').innerHTML = '';
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
                            <h6><b style="font-family:'Poppins';font-weight: normal;">${data.gameInfo.venue.fullName}</b></h6>
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
                            <h6 style="color: ${display_clock_color}; margin-top: 0;"><b style="font-family:'Poppins';font-weight: normal;">${display_clock}</b></h6>
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

            const home_team_name = data.leaders[0].team.abbreviation;
            const away_team_name = data.leaders[1].team.abbreviation;

            const home_points_leader_name = data.leaders[0].leaders[0].leaders[0].athlete.shortName;
            const home_points_leader_position = data.leaders[0].leaders[0].leaders[0].athlete.position.abbreviation;
            const home_points_leader_headshot = data.leaders[0].leaders[0].leaders[0].athlete.headshot.href;

            const home_points_leader_points_value = data.leaders[0].leaders[0].leaders[0].statistics[0].displayValue;
            const home_points_leader_fg_value = data.leaders[0].leaders[0].leaders[0].statistics[1].displayValue;
            const home_points_leader_ft_value = data.leaders[0].leaders[0].leaders[0].statistics[2].displayValue;

            const away_points_leader_name = data.leaders[1].leaders[0].leaders[0].athlete.shortName;
            const away_points_leader_position = data.leaders[1].leaders[0].leaders[0].athlete.position.abbreviation;
            const away_points_leader_headshot = data.leaders[1].leaders[0].leaders[0].athlete.headshot.href;

            const away_points_leader_points_value = data.leaders[1].leaders[0].leaders[0].statistics[0].displayValue;
            const away_points_leader_fg_value = data.leaders[1].leaders[0].leaders[0].statistics[1].displayValue;
            const away_points_leader_ft_value = data.leaders[1].leaders[0].leaders[0].statistics[2].displayValue;

            document.getElementById('points-container').innerHTML = `
                <table class="game-leaders-table">
                    <tr>
                        <td rowspan="2"><img src="${away_points_leader_headshot}" class="headshot-super-small"></td>
                        <td colspan="3"><h6>${away_points_leader_name} &mdash; ${away_team_name} ${away_points_leader_position}</h6></td>
                    </tr>
                    <tr>
                        <td><h6 style="text-align:center;"><b>${away_points_leader_points_value}</b></h6><h6 style="text-align:center;">PTS</h6></td>
                        <td width="60%"><h6 style="text-align:center;"><b>${away_points_leader_fg_value}</b></h6><h6 style="text-align:center;">FG</h6></td>
                        <td><h6 style="text-align:center;"><b>${away_points_leader_ft_value}</b></h6><h6 style="text-align:center;">FT</h6></td>
                    </tr>
                </table>
                <table class="game-leaders-table">
                    <tr>
                        <td rowspan="2"><img src="${home_points_leader_headshot}" class="headshot-super-small"></td>
                        <td colspan="3"><h6>${home_points_leader_name} &mdash; ${home_team_name} ${home_points_leader_position}</h6></td>
                    </tr>
                    <tr>
                        <td><h6 style="text-align:center;"><b>${home_points_leader_points_value}</b></h6><h6 style="text-align:center;">PTS</h6></td>
                        <td width="60%"><h6 style="text-align:center;"><b>${home_points_leader_fg_value}</b></h6><h6 style="text-align:center;">FG</h6></td>
                        <td><h6 style="text-align:center;"><b>${home_points_leader_ft_value}</b></h6><h6 style="text-align:center;">FT</h6></td>
                    </tr>
                </table>
            `;

            const home_assists_leader_name = data.leaders[0].leaders[1].leaders[0].athlete.shortName;
            const home_assists_leader_position = data.leaders[0].leaders[1].leaders[0].athlete.position.abbreviation;
            const home_assists_leader_headshot = data.leaders[0].leaders[1].leaders[0].athlete.headshot.href;

            const home_assists_leader_assists = data.leaders[0].leaders[1].leaders[0].statistics[0].displayValue;
            const home_assists_leader_turnovers = data.leaders[0].leaders[1].leaders[0].statistics[1].displayValue;
            const home_assists_leader_minutes = data.leaders[0].leaders[1].leaders[0].statistics[2].displayValue;
            const home_assists_leader_ast_to = data.leaders[0].leaders[1].leaders[0].statistics[3].displayValue;

            const away_assists_leader_name = data.leaders[1].leaders[1].leaders[0].athlete.shortName;
            const away_assists_leader_position = data.leaders[1].leaders[1].leaders[0].athlete.position.abbreviation;
            const away_assists_leader_headshot = data.leaders[1].leaders[1].leaders[0].athlete.headshot.href;

            const away_assists_leader_assists = data.leaders[1].leaders[1].leaders[0].statistics[0].displayValue;
            const away_assists_leader_turnovers = data.leaders[1].leaders[1].leaders[0].statistics[1].displayValue;
            const away_assists_leader_minutes = data.leaders[1].leaders[1].leaders[0].statistics[2].displayValue;
            const away_assists_leader_ast_to = data.leaders[1].leaders[1].leaders[0].statistics[3].displayValue;

            document.getElementById('assists-container').innerHTML = `
                <table class="game-leaders-table">
                    <tr>
                        <td rowspan="2"><img src="${away_assists_leader_headshot}" class="headshot-super-small"></td>
                        <td colspan="3"><h6>${away_assists_leader_name} &mdash; ${away_team_name} ${away_assists_leader_position}</h6></td>
                    </tr>
                    <tr>
                        <td><h6 style="text-align:center;"><b>${away_assists_leader_assists}</b></h6><h6 style="text-align:center;">AST</h6></td>
                        <td width="25%"><h6 style="text-align:center;"><b>${away_assists_leader_turnovers}</b></h6><h6 style="text-align:center;">TO</h6></td>
                        <td width="25%"><h6 style="text-align:center;"><b>${away_assists_leader_minutes}</b></h6><h6 style="text-align:center;">MIN</h6></td>
                        <td><h6 style="text-align:center;"><b>${away_assists_leader_ast_to}</b></h6><h6 style="text-align:center;">AST/TO</h6></td>
                    </tr>
                </table>
                <table class="game-leaders-table">
                    <tr>
                        <td rowspan="2"><img src="${home_assists_leader_headshot}" class="headshot-super-small"></td>
                        <td colspan="3"><h6>${home_assists_leader_name} &mdash; ${home_team_name} ${home_assists_leader_position}</h6></td>
                    </tr>
                    <tr>
                        <td><h6 style="text-align:center;"><b>${home_assists_leader_assists}</b></h6><h6 style="text-align:center;">AST</h6></td>
                        <td width="25%"><h6 style="text-align:center;"><b>${home_assists_leader_turnovers}</b></h6><h6 style="text-align:center;">TO</h6></td>
                        <td width="25%"><h6 style="text-align:center;"><b>${home_assists_leader_minutes}</b></h6><h6 style="text-align:center;">MIN</h6></td>
                        <td><h6 style="text-align:center;"><b>${home_assists_leader_ast_to}</b></h6><h6 style="text-align:center;">AST/TO</h6></td>
                    </tr>
                </table>
            `;
            const home_rebounds_leader_name = data.leaders[0].leaders[2].leaders[0].athlete.shortName;
            const home_rebounds_leader_position = data.leaders[0].leaders[2].leaders[0].athlete.position.abbreviation;
            const home_rebounds_leader_headshot = data.leaders[0].leaders[2].leaders[0].athlete.headshot.href;

            const home_rebounds_leader_rebounds = data.leaders[0].leaders[2].leaders[0].statistics[0].displayValue;
            const home_rebounds_leader_defensive = data.leaders[0].leaders[2].leaders[0].statistics[1].displayValue;
            const home_rebounds_leader_offensive = data.leaders[0].leaders[2].leaders[0].statistics[2].displayValue;

            const away_rebounds_leader_name = data.leaders[1].leaders[2].leaders[0].athlete.shortName;
            const away_rebounds_leader_position = data.leaders[1].leaders[2].leaders[0].athlete.position.abbreviation;
            const away_rebounds_leader_headshot = data.leaders[1].leaders[2].leaders[0].athlete.headshot.href;

            const away_rebounds_leader_rebounds = data.leaders[1].leaders[2].leaders[0].statistics[0].displayValue;
            const away_rebounds_leader_defensive = data.leaders[1].leaders[2].leaders[0].statistics[1].displayValue;
            const away_rebounds_leader_offensive = data.leaders[1].leaders[2].leaders[0].statistics[2].displayValue;

            document.getElementById('rebounds-container').innerHTML = `
                <table class="game-leaders-table">
                    <tr>
                        <td rowspan="2"><img src="${away_rebounds_leader_headshot}" class="headshot-super-small"></td>
                        <td colspan="3"><h6>${away_rebounds_leader_name} &mdash; ${away_team_name} ${away_rebounds_leader_position}</h6></td>
                    </tr>
                    <tr>
                        <td><h6 style="text-align:center;"><b>${away_rebounds_leader_rebounds}</b></h6><h6 style="text-align:center;">REB</h6></td>
                        <td width="60%"><h6 style="text-align:center;"><b>${away_rebounds_leader_defensive}</b></h6><h6 style="text-align:center;">DEF</h6></td>
                        <td><h6 style="text-align:center;"><b>${away_rebounds_leader_offensive}</b></h6><h6 style="text-align:center;">OFF</h6></td>
                    </tr>
                </table>
                <table class="game-leaders-table">
                    <tr>
                        <td rowspan="2"><img src="${home_rebounds_leader_headshot}" class="headshot-super-small"></td>
                        <td colspan="3"><h6>${home_rebounds_leader_name} &mdash; ${home_team_name} ${home_rebounds_leader_position}</h6></td>
                    </tr>
                    <tr>
                        <td><h6 style="text-align:center;"><b>${home_rebounds_leader_rebounds}</b></h6><h6 style="text-align:center;">REB</h6></td>
                        <td width="60%"><h6 style="text-align:center;"><b>${home_rebounds_leader_defensive}</b></h6><h6 style="text-align:center;">DEF</h6></td>
                        <td><h6 style="text-align:center;"><b>${home_rebounds_leader_offensive}</b></h6><h6 style="text-align:center;">OFF</h6></td>                    </tr>
                </table>
            `;
    });
}

    function getScoreboardData() {

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const yearToday = today.getFullYear();
        const monthToday = String(today.getMonth() + 1).padStart(2, '0');
        const dayToday = String(today.getDate()).padStart(2, '0');
        const yyyy_mm_dd_today = `${yearToday}${monthToday}${dayToday}`;

        const yearYesterday = yesterday.getFullYear();
        const monthYesterday = String(yesterday.getMonth() + 1).padStart(2, '0');
        const dayYesterday = String(yesterday.getDate()).padStart(2, '0');
        const yyyy_mm_dd_yesterday = `${yearYesterday}${monthYesterday}${dayYesterday}`;

        return fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${yyyy_mm_dd_yesterday}-${yyyy_mm_dd_today}`)
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

    function callGameOnLoad() {
        getScoreboardData().then((data) => {
            let jsonData;
            jsonData = data;
            console.log(jsonData);
            const games = jsonData.events.filter(event => event.competitions[0].status.type.state === "post");
            parseGameData(games[games.length - 1].id);
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

                const game_status = score_data.status.type.state; // "pre" "in" "post"
                const game_status_detail = score_data.status.type.shortDetail; // "1st Quarter" "Final" "Halftime"

                if (home_win && game_status == "post" ) {
                    home_background = '#900';
                    home_color = 'white';

                    away_color = 'black';
                    away_background = 'transparent';
                } else if (!(home_win) && game_status == "post") {
                    home_color = 'black';
                    home_background = 'transparent';

                    away_color = 'white';
                    away_background = '#900';
                } else {
                    home_color = 'black';
                    home_background = 'transparent';

                    away_color = 'black';
                    away_background = 'transparent';
                }

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

function toggleLeadersStats() {
    const pointsHeader = document.getElementById('points-container');
    const reboundsHeader = document.getElementById('rebounds-container');
    const assistsHeader = document.getElementById('assists-container');

    const pointsButton = document.querySelector('td:nth-child(1)');
    const reboundsButton = document.querySelector('td:nth-child(2)');
    const assistsButton = document.querySelector('td:nth-child(3)');

    pointsButton.addEventListener('click', () => {
        pointsHeader.style.display = 'block';
        reboundsHeader.style.display = 'none';
        assistsHeader.style.display = 'none';

        pointsButton.classList.add('leaders-stats-onclick');
        reboundsButton.classList.remove('leaders-stats-onclick');
        assistsButton.classList.remove('leaders-stats-onclick');
    });

    reboundsButton.addEventListener('click', () => {
        pointsHeader.style.display = 'none';
        reboundsHeader.style.display = 'block';
        assistsHeader.style.display = 'none';

        pointsButton.classList.remove('leaders-stats-onclick');
        reboundsButton.classList.add('leaders-stats-onclick');
        assistsButton.classList.remove('leaders-stats-onclick');
    });

    assistsButton.addEventListener('click', () => {
        pointsHeader.style.display = 'none';
        reboundsHeader.style.display = 'none';
        assistsHeader.style.display = 'block';

        pointsButton.classList.remove('leaders-stats-onclick');
        reboundsButton.classList.remove('leaders-stats-onclick');
        assistsButton.classList.add('leaders-stats-onclick');
    });

    pointsButton.click();
}