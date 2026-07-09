export { Login, Registration, ResetPassword, Verify } from './auth';

export { GameDetails, Scoreboard } from './game';

export { Teams, TeamDetails, ModifyTeam } from './team';

export { Admin, UserManagement, GameManagement, TeamManagement, EditTeam, CoachManagement, CoachTransactionLog,
    EditGame, StatsManagement, Reports, Scheduling, GameWeek } from './admin';

export { Home, Profile, Standings, Rankings, Schedule, Error, NotFound } from './core';

export { UserDetails } from './user';

export { Records, SeasonStats, LeagueStats, Leaderboard, EloHistory, Charts } from './stats';

export { default as Complete } from './register/Complete';
export { default as RegistrationSuccess } from './register/Success';
