import React from 'react';

interface HeaderPanelProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  actions?: React.ReactNode;
}

const HeaderPanel = ({ title, description, icon, actions }: HeaderPanelProps) => {
  return (
    <div className='mb-8 flex items-center justify-between gap-3'>
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbba0e] shadow-md shadow-[#fbba0e]/20'>
          {icon}
        </div>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-slate-100'>
            {title}
          </h1>
          <p className='text-sm text-slate-400'>{description}</p>
        </div>
      </div>
      {actions}
    </div>
  );
};

export default HeaderPanel;
