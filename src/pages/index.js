export { Login, Registration, ResetPassword, Verify } from './auth';

export { GameDetails, Scoreboard } from './game';

export { Teams, TeamDetails, ModifyTeam } from './team';

export { Admin, UserManagement, GameManagement, TeamManagement, EditTeam, EditCoach, CoachTransactionLog,
    EditGame, StatsManagement, Reports, Scheduling, GameWeek, RankingsManagement, AdminConferences, AdminConferenceDetail } from './admin';

export { Home, Profile, Standings, Rankings, Schedule, Error, NotFound } from './core';

export { UserDetails, Coaches } from './user';

export { Stats, RecordsBoard, Graphs } from './stats';

export { default as Complete } from './register/Complete';
export { default as RegistrationSuccess } from './register/Success';
