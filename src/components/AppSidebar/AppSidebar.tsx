import { Link, NavLink, useLocation, matchPath } from 'react-router-dom';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

import {
  Settings,
  LogOut,
  // User,
  PanelBottomOpen,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import { navGroups } from './elements';

const AppSidebar = () => {
  const { user, logout } = useAuthStore();
  const { pathname } = useLocation();

  const isActive = (path: string) =>
    path === '/'
      ? pathname === '/'
      : !!matchPath({ path, end: false }, pathname);

  const formatName = (first: string, surname: string) => {
    const firstName = first.trim().split(' ')[0]; // solo el primer nombre
    const capitalize = (s: string) =>
      s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    return `${capitalize(firstName)} ${capitalize(surname)}`;
  };

  const displayName = user
    ? formatName(user.first_name ?? '', user.paternal_surname ?? '')
    : '';

  const displayUsername = user?.username ?? '';

  const userFormated = {
    name: displayName,
    username: displayUsername,
    avatar: '', // URL si tienes
  };

  return (
    <Sidebar>
      {/* HEADER */}
      <SidebarHeader className='flex flex-col items-center  gap-1 py-4 bg-[#111] border-b border-white/10'>
        <img
          src='/img/logo_sin_fondo.webp'
          alt='SIGEPO'
          className='w-36 px-2'
        />
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent className='px-2 bg-[#111] text-slate-200'>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className='text-[#fbba0e]'>
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.label}
                    className='cursor-pointer transition hover:bg-[#fbba0e]/90 hover:text-black data-[active=true]:bg-[#fbba0e]/10 data-[active=true]:text-[#fbba0e] data-[active=true]:border-l-2 data-[active=true]:border-[#fbba0e] data-[active=true]:pl-1.5 rounded-bl-none rounded-tl-none'
                  >
                    <NavLink to={item.path}>
                      <item.icon className='w-4 h-4' />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* FOOTER PRO */}
      <SidebarFooter className='p-3 border-t border-white/10 bg-[#111]'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className='flex items-center justify-between cursor-pointer rounded-xl p-2 hover:bg-[#111]'>
              <div className='flex items-center gap-3'>
                <Avatar className='w-9 h-9'>
                  <AvatarImage src={userFormated.avatar} />
                  <AvatarFallback className='bg-[#fbba0e] text-black'>
                    {userFormated.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className='flex flex-col text-sm leading-tight'>
                  <span className='font-medium text-[#fbba0e]'>
                    {userFormated.name}
                  </span>
                  <span className='text-xs text-slate-200'>
                    {userFormated.username}
                  </span>
                </div>
              </div>

              <div className='flex items-center'>
                <button className='text-white/30 hover:text-white/60 transition-colors'>
                  <PanelBottomOpen className='size-5 cursor-pointer text-slate-200 hover:text-slate-50' />
                </button>
              </div>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align='end'
            className='w-48 bg-[#111] text-slate-200 border border-white/10 '
          >
            {/* <DropdownMenuItem className='cursor-pointer hover:bg-[#fbba0e]/90 transition hover:text-black'>
              <User className='w-4 h-4 mr-2' />
              Perfil
            </DropdownMenuItem> */}

            <Link to='/change-password'>
              <DropdownMenuItem className='cursor-pointer hover:bg-[#fbba0e]/90 transition hover:text-black'>
                <Settings className='w-4 h-4 mr-2' />
                Configuración
              </DropdownMenuItem>
            </Link>

            <DropdownMenuItem
              className='text-red-500 cursor-pointer  hover:text-red-400 transition'
              onClick={logout}
            >
              <LogOut className='w-4 h-4 mr-2' />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
