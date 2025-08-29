// Auth Pages
export { Login, Registration, ResetPassword, Verify } from './auth';

// Game Pages
export { GameDetails, Scoreboard } from './game';

// Team Pages
export { Teams, TeamDetails, ModifyTeam } from './team';

// Admin Pages
export { Admin, UserManagement, GameManagement, TeamManagement, TeamEdit, CoachManagement } from './admin';

// Core Pages
export { Home, Profile, Standings, Rankings, Error, NotFound } from './core';

// Register Pages (special flow)
export { default as Complete } from './register/Complete';
export { default as RegistrationSuccess } from './register/Success'; 