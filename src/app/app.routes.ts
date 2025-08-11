import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { Account } from './pages/account/account';
import { authGuard } from './guards/auth-guard';
import { Users } from './pages/users/users';
import { roleGuard } from './guards/role-guard';
import { Role } from './pages/role/role';
import { ResetPassword } from './pages/reset-password/reset-password';
import { ForgetPassword } from './pages/forget-password/forget-password';
import { ChangePassword } from './pages/change-password/change-password';
import { Proveedores } from './pages/proveedores/proveedores';
import { MateriaPrima } from './pages/materia-prima/materia-prima';
import { Servicios } from './pages/servicios/servicios';
import { Contactanos } from './pages/contactanos/contactanos';
import { Comentarios } from './pages/comentarios/comentarios';
import { HistoricoComponent } from './pages/historico/historico.component';
import { Compras } from './pages/compras/compras';
import { Ventas } from './pages/ventas/ventas';

export const routes: Routes = [
    {
        path: 'login',
        component: Login
    },
    {
        path: 'register',
        component: Register
    },
    {
        path: '',
        component: Home
    },
    {
        path: 'account/:id',
        component: Account,
        canActivate: [authGuard],
    },
    {
        path: 'users',
        component: Users,
        canActivate: [roleGuard],
        data: {
            roles: ['Admin'],
        },
    },
    {
        path: 'roles',
        component: Role,
        canActivate: [roleGuard],
        data: {
            roles: ['Admin'],
        },
    },
    {
        path: 'forget-password',
        component: ForgetPassword,
    },
    {
        path: 'reset-password',
        component: ResetPassword,
    },
    {
        path: 'change-password',
        component: ChangePassword,
        canActivate: [authGuard],
    },
    {
        path: 'proveedores',
        component: Proveedores,
        canActivate: [roleGuard],
        data: {
            roles: ['Admin']
        }
    },
    {
        path: 'materia-prima',
        component: MateriaPrima,
        canActivate: [roleGuard],
        data: {
            roles: ['Admin']
        }
    },
    {
        path: 'servicios',
        component: Servicios,
        canActivate: [roleGuard],
        data: {
            roles: ['Admin']
        }
    },
     {
        path: 'contactanos',
        component: Contactanos,
    },
    {
        path: 'comentarios',
        component: Comentarios,
        canActivate: [roleGuard],
        data:{
            roles: ['Admin', 'User']
        } 
    },
    {
        path: 'historico',
        component: HistoricoComponent,
        canActivate: [roleGuard],
        data:{
            roles: ['User']
        } 
    },
    {
        path: 'compras',
        component: Compras,
        canActivate: [roleGuard],
        data:{
            roles: ['Admin']
        }
    },
    {
        path: 'ventas',
        component: Ventas,
        canActivate: [roleGuard],
        data:{
            roles: ['Admin']
        }
    }
];
