import {
  CalendarDays,
  Mic2,
  ChevronRight,
  Brackets,
  Users,
  University,
  Barcode,
  Ticket,
  ChartSpline,
  DollarSign,
  ActivityIcon,
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap,
  UserCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const modules = [
  {
    icon: Users,
    label: 'Participantes',
    description: 'Gestiona los inscritos al congreso.',
    href: '/participant',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
  },
  {
    icon: University,
    label: 'Universidades',
    description: 'Administra las universidades socias.',
    href: '/partner-university',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
  },
  {
    icon: CalendarDays,
    label: 'Días',
    description: 'Gestiona los días del congreso.',
    href: '/day',
    color: 'text-[#fbba0e]',
    bg: 'bg-[#fbba0e]/10',
    border: 'border-[#fbba0e]/20',
  },
  {
    icon: Mic2,
    label: 'Speakers',
    description: 'Administra los speakers y sus datos.',
    href: '/speaker',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20',
  },
  {
    icon: Brackets,
    label: 'Tipos de Actividad',
    description: 'Configura las categorías de actividades.',
    href: '/activity-type',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
  },
  {
    icon: ActivityIcon,
    label: 'Actividades',
    description: 'Gestiona el cronograma de actividades.',
    href: '/activity',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
  },
  {
    icon: Ticket,
    label: 'Cupos',
    description: 'Controla los cupos disponibles.',
    href: '/available-slot',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    border: 'border-pink-400/20',
  },
  {
    icon: ChartSpline,
    label: 'Pre-venta',
    description: 'Gestiona las etapas de preventa.',
    href: '/pre-sale',
    color: 'text-teal-400',
    bg: 'bg-teal-400/10',
    border: 'border-teal-400/20',
  },
  {
    icon: DollarSign,
    label: 'Tipos de Cuota',
    description: 'Configura las categorías de pago.',
    href: '/quota-type',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
  },
  {
    icon: Barcode,
    label: 'Códigos Generales',
    description: 'Genera y gestiona códigos de acceso.',
    href: '/dynamic-code',
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
    border: 'border-rose-400/20',
  },
];

const QUOTA_COLORS = ['#a855f7', '#22d3ee', '#fbba0e', '#34d399'];

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  loading?: boolean;
}

const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  color,
  bg,
  border,
  loading,
}: StatCardProps) => (
  <div
    className={`flex flex-col gap-3 p-4 sm:p-5 rounded-2xl border bg-[#1a1a1a] ${border}`}
  >
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bg}`}
    >
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    {loading ? (
      <div className='h-7 w-20 rounded bg-white/5 animate-pulse' />
    ) : (
      <p className='text-2xl font-black text-slate-100 leading-none'>{value}</p>
    )}
    <div>
      <p className='text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500 leading-tight'>
        {label}
      </p>
      {!loading && sub && (
        <p className='text-[10px] sm:text-xs text-slate-600 mt-0.5'>{sub}</p>
      )}
    </div>
  </div>
);

interface ProgressBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

const ProgressBar = ({ label, value, total, color }: ProgressBarProps) => {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex items-center justify-between text-xs'>
        <span className='text-slate-400'>{label}</span>
        <span className='text-slate-300 font-semibold'>
          {value} / {total}
        </span>
      </div>
      <div className='h-1.5 w-full rounded-full bg-white/5'>
        <div
          className={`h-1.5 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const PanelCard = ({
  title,
  icon,
  children,
  className = '',
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-2xl border border-white/10 bg-[#1a1a1a] p-5 space-y-4 ${className}`}
  >
    <div className='flex items-center gap-2'>
      {icon}
      <p className='text-sm font-bold text-slate-200'>{title}</p>
    </div>
    {children}
  </div>
);

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`rounded bg-white/5 animate-pulse ${className}`} />
);

const AdminHome = () => {
  const { data, loading, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const p = data?.participants;
  const rawPreSale = data?.active_pre_sale;
  const now = new Date();
  const activePreSale =
    rawPreSale &&
    new Date(rawPreSale.start_date) <= now &&
    now <= new Date(rawPreSale.end_date)
      ? rawPreSale
      : null;

  const byDateFormatted = (p?.by_date ?? []).map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
    }),
  }));

  return (
    <div className='bg-[#111] min-h-screen px-4 sm:px-6 md:px-8 py-8 sm:py-10 space-y-8'>
      {/* ── Bienvenida ─────────────────────────────────────────────── */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-xs font-bold tracking-[0.3em] uppercase text-[#fbba0e] mb-2'>
            CONAEA 2026 · Panel de Administración
          </p>
          <h1 className='text-3xl sm:text-4xl font-black text-slate-100 leading-tight mb-2'>
            Bienvenido al sistema
          </h1>
          <p className='text-slate-500 text-sm max-w-lg'>
            Desde aquí puedes gestionar todo el contenido del XXXII Congreso
            Nacional de Estudiantes de Agronomía.
          </p>
          <div className='w-12 h-0.5 bg-[#fbba0e] rounded-full mt-4' />
        </div>
        <div className='shrink-0 flex flex-col items-end gap-1 pt-1'>
          <p className='text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500'>
            Preventa activa
          </p>
          {loading ? (
            <Skeleton className='h-5 w-28 mt-1' />
          ) : activePreSale ? (
            <>
              <p className='text-sm font-black text-slate-100'>
                {activePreSale.name}
              </p>
              <span
                className={`text-xs font-bold uppercase tracking-wide ${activePreSale.booking_mode ? 'text-amber-400' : 'text-slate-400'}`}
              >
                {activePreSale.booking_mode ? 'Reserva' : 'Directo'}
              </span>
            </>
          ) : (
            <p className='text-xs text-slate-600 mt-1'>Sin preventa activa</p>
          )}
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3'>
        <StatCard
          label='Participantes'
          value={p?.total ?? 0}
          sub={`${p?.validated ?? 0} validados`}
          icon={Users}
          color='text-purple-400'
          bg='bg-purple-400/10'
          border='border-purple-400/20'
          loading={loading}
        />
        <StatCard
          label='Cupos totales'
          value={data?.slots.total ?? 0}
          sub={`${data?.slots.used ?? 0} usados`}
          icon={Ticket}
          color='text-pink-400'
          bg='bg-pink-400/10'
          border='border-pink-400/20'
          loading={loading}
        />
        <StatCard
          label='Universidades'
          value={data?.universities.total ?? 0}
          sub={`${data?.universities.with_participants ?? 0} con inscritos`}
          icon={GraduationCap}
          color='text-cyan-400'
          bg='bg-cyan-400/10'
          border='border-cyan-400/20'
          loading={loading}
        />
        <StatCard
          label='Delegados'
          value={data?.delegates.total ?? 0}
          sub='registrados'
          icon={UserCheck}
          color='text-emerald-400'
          bg='bg-emerald-400/10'
          border='border-emerald-400/20'
          loading={loading}
        />
        <StatCard
          label='Speakers'
          value={data?.speakers ?? 0}
          sub='registrados'
          icon={Mic2}
          color='text-green-400'
          bg='bg-green-400/10'
          border='border-green-400/20'
          loading={loading}
        />
        <StatCard
          label='Días del congreso'
          value={data?.days ?? 0}
          sub={`${data?.activities.total ?? 0} actividades`}
          icon={CalendarDays}
          color='text-[#fbba0e]'
          bg='bg-[#fbba0e]/10'
          border='border-[#fbba0e]/20'
          loading={loading}
        />
      </div>

      {/* ── Gráfico de línea: inscripciones por día ─────────────────── */}
      <PanelCard
        title='Inscripciones por día'
        icon={<Users className='w-4 h-4 text-purple-400' />}
      >
        {loading ? (
          <Skeleton className='h-48' />
        ) : byDateFormatted.length > 0 ? (
          <ResponsiveContainer width='100%' height={200}>
            <LineChart
              data={byDateFormatted}
              margin={{ top: 4, right: 16, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey='date'
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#a855f7' }}
              />
              <Line
                type='monotone'
                dataKey='count'
                name='Inscritos'
                stroke='#a855f7'
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#a855f7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className='text-xs text-slate-600 text-center py-8'>
            Sin datos de inscripciones
          </p>
        )}
      </PanelCard>

      {/* ── Fila media ──────────────────────────────────────────────── */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {/* Validaciones */}
        <PanelCard
          title='Estado de validaciones'
          icon={<UserCheck className='w-4 h-4 text-[#fbba0e]' />}
        >
          {loading ? (
            <div className='space-y-3'>
              {[1, 2].map((i) => (
                <Skeleton key={i} className='h-8' />
              ))}
            </div>
          ) : (
            <div className='space-y-3'>
              <ProgressBar
                label='Validados'
                value={p?.validated ?? 0}
                total={p?.total ?? 0}
                color='bg-green-500'
              />
              <ProgressBar
                label='Pendientes'
                value={p?.pending ?? 0}
                total={p?.total ?? 0}
                color='bg-yellow-500'
              />
              <div className='pt-2 flex items-center justify-between text-xs text-slate-500'>
                <span>Total: {p?.total ?? 0} participantes</span>
                <Link
                  to='/participant'
                  className='text-[#fbba0e] hover:underline font-semibold'
                >
                  Ver todos
                </Link>
              </div>
            </div>
          )}
        </PanelCard>

        {/* Distribución por tipo de cuota */}
        <PanelCard
          title='Por tipo de cuota'
          icon={<DollarSign className='w-4 h-4 text-emerald-400' />}
        >
          {loading ? (
            <Skeleton className='h-40' />
          ) : (p?.by_quota_type ?? []).length > 0 ? (
            <div className='flex items-center gap-4'>
              <ResponsiveContainer width='50%' height={140}>
                <PieChart>
                  <Pie
                    data={p!.by_quota_type}
                    dataKey='count'
                    nameKey='quota_type'
                    cx='50%'
                    cy='50%'
                    innerRadius={36}
                    outerRadius={58}
                    strokeWidth={0}
                  >
                    {p!.by_quota_type.map((_, i) => (
                      <Cell
                        key={i}
                        fill={QUOTA_COLORS[i % QUOTA_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a1a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className='flex flex-col gap-2 flex-1'>
                {p!.by_quota_type.map((qt, i) => (
                  <div
                    key={qt.quota_type}
                    className='flex items-center justify-between text-xs'
                  >
                    <div className='flex items-center gap-1.5'>
                      <div
                        className='w-2 h-2 rounded-full shrink-0'
                        style={{
                          background: QUOTA_COLORS[i % QUOTA_COLORS.length],
                        }}
                      />
                      <span className='text-slate-400'>{qt.quota_type}</span>
                    </div>
                    <span className='text-slate-200 font-semibold'>
                      {qt.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className='text-xs text-slate-600 text-center py-8'>Sin datos</p>
          )}
        </PanelCard>

        {/* Preventa activa */}
        <PanelCard
          title='Preventa activa'
          icon={<Clock className='w-4 h-4 text-teal-400' />}
        >
          {loading ? (
            <Skeleton className='h-40' />
          ) : activePreSale ? (
            <div className='space-y-3'>
              <div className='p-3 rounded-xl bg-teal-500/5 border border-teal-500/20'>
                <p className='text-sm font-black text-teal-400 mb-1'>
                  {activePreSale.name}
                </p>
                <p className='text-xs text-slate-500'>
                  Inicio:{' '}
                  {new Date(activePreSale.start_date).toLocaleDateString(
                    'es-PE',
                  )}
                </p>
                <p className='text-xs text-slate-500'>
                  Fin:{' '}
                  {new Date(activePreSale.end_date).toLocaleDateString('es-PE')}
                </p>
              </div>
              <div className='space-y-2.5'>
                {activePreSale.slots.map((slot, i) => (
                  <ProgressBar
                    key={i}
                    label={slot.quota_type__name}
                    value={slot.used}
                    total={slot.amount}
                    color='bg-teal-500'
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-6 text-center'>
              <XCircle className='w-8 h-8 text-slate-600 mb-2' />
              <p className='text-xs text-slate-500'>Sin preventa activa</p>
              <Link
                to='/pre-sale'
                className='text-[#fbba0e] text-xs hover:underline mt-1 font-semibold'
              >
                Configurar preventa
              </Link>
            </div>
          )}
        </PanelCard>
      </div>

      {/* ── Fila inferior ───────────────────────────────────────────── */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {/* Inscripciones por preventa */}
        <PanelCard
          title='Inscritos por preventa'
          icon={<ChartSpline className='w-4 h-4 text-pink-400' />}
        >
          {loading ? (
            <Skeleton className='h-40' />
          ) : (p?.by_pre_sale ?? []).length > 0 ? (
            <ResponsiveContainer width='100%' height={160}>
              <BarChart
                data={p!.by_pre_sale}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey='pre_sale'
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  itemStyle={{ color: '#ec4899' }}
                />
                <Bar
                  dataKey='count'
                  name='Inscritos'
                  fill='#ec4899'
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className='text-xs text-slate-600 text-center py-8'>Sin datos</p>
          )}
        </PanelCard>

        {/* Top universidades */}
        <PanelCard
          title='Top universidades'
          icon={<GraduationCap className='w-4 h-4 text-cyan-400' />}
        >
          {loading ? (
            <div className='space-y-2'>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className='h-6' />
              ))}
            </div>
          ) : (data?.top_universities ?? []).length > 0 ? (
            <div className='space-y-2'>
              {data!.top_universities.slice(0, 7).map((u, i) => (
                <div key={u.abbreviation} className='flex items-center gap-2'>
                  <span className='text-[10px] font-bold text-slate-600 w-4 shrink-0'>
                    {i + 1}
                  </span>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-slate-300 font-semibold truncate'>
                        {u.abbreviation}
                      </span>
                      <span className='text-xs text-slate-400 shrink-0 ml-2'>
                        {u.count}
                      </span>
                    </div>
                    <div className='h-1 w-full rounded-full bg-white/5 mt-1'>
                      <div
                        className='h-1 rounded-full bg-cyan-500'
                        style={{
                          width: `${((u.count / (data!.top_universities[0]?.count || 1)) * 100).toFixed(1)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-xs text-slate-600 text-center py-8'>Sin datos</p>
          )}
        </PanelCard>

        {/* Códigos generales + Actividades por día */}
        <div className='space-y-4'>
          <PanelCard
            title='Códigos generales'
            icon={<Barcode className='w-4 h-4 text-rose-400' />}
          >
            {loading ? (
              <div className='space-y-3'>
                {[1, 2].map((i) => (
                  <Skeleton key={i} className='h-10' />
                ))}
              </div>
            ) : (
              <div className='space-y-3'>
                <div className='flex items-center justify-between p-3 rounded-xl bg-green-500/5 border border-green-500/20'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle2 className='w-4 h-4 text-green-400' />
                    <span className='text-xs text-slate-400'>Disponibles</span>
                  </div>
                  <span className='text-lg font-black text-green-400'>
                    {data?.codes.available ?? 0}
                  </span>
                </div>
                <div className='flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/20'>
                  <div className='flex items-center gap-2'>
                    <XCircle className='w-4 h-4 text-red-400' />
                    <span className='text-xs text-slate-400'>Usados</span>
                  </div>
                  <span className='text-lg font-black text-red-400'>
                    {data?.codes.used ?? 0}
                  </span>
                </div>
                <ProgressBar
                  label='Uso total'
                  value={data?.codes.used ?? 0}
                  total={data?.codes.total ?? 0}
                  color='bg-rose-500'
                />
              </div>
            )}
          </PanelCard>

          <PanelCard
            title='Actividades por día'
            icon={<ActivityIcon className='w-4 h-4 text-orange-400' />}
          >
            {loading ? (
              <div className='space-y-2'>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className='h-6' />
                ))}
              </div>
            ) : (data?.activities.by_day ?? []).length > 0 ? (
              <div className='space-y-2'>
                {data!.activities.by_day.map((d) => (
                  <div
                    key={d.day}
                    className='flex items-center justify-between text-xs'
                  >
                    <span className='text-slate-400'>{d.day}</span>
                    <span className='text-slate-200 font-semibold'>
                      {d.count} actividades
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-xs text-slate-600 text-center py-4'>
                Sin actividades programadas
              </p>
            )}
          </PanelCard>
        </div>
      </div>

      {/* ── Módulos ─────────────────────────────────────────────────── */}
      <div>
        <p className='text-xs font-bold tracking-[0.2em] uppercase text-slate-500 mb-4'>
          Accesos rápidos
        </p>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.label}
                to={mod.href}
                className={[
                  'group flex flex-col gap-3 p-3 sm:p-4 rounded-2xl border bg-[#1a1a1a] transition-all duration-200',
                  'hover:bg-[#222] hover:-translate-y-0.5 hover:shadow-lg',
                  mod.border,
                ].join(' ')}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border ${mod.bg} ${mod.border}`}
                >
                  <Icon className={`w-4 h-4 ${mod.color}`} />
                </div>
                <div className='flex-1'>
                  <p className='text-slate-100 font-bold text-xs mb-0.5'>
                    {mod.label}
                  </p>
                  <p className='text-slate-600 text-xs leading-relaxed hidden sm:block'>
                    {mod.description}
                  </p>
                </div>
                <ChevronRight className='w-3.5 h-3.5 transition-all duration-200 text-slate-600 group-hover:translate-x-1' />
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <div className='flex items-center gap-2 pt-4'>
        <div className='w-8 h-px bg-white/10' />
        <p className='text-white/20 text-xs tracking-widest uppercase'>
          CONAEA 2026 · Sistema de Gestión
        </p>
        <div className='w-8 h-px bg-white/10' />
      </div>
    </div>
  );
};

export default AdminHome;
