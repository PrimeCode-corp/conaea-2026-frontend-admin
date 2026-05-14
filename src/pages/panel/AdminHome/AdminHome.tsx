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
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useParticipantStore } from '@/store/useParticipantStore';
import { usePreSaleStore } from '@/store/usePreSaleStore';
import { useAvailableSlotStore } from '@/store/useAvailableSlotStore';
import { useDynamicCodeStore } from '@/store/useDynamicCodeStore';
import { useSpeakerStore } from '@/store/useSpeakerStore';
import { useDayStore } from '@/store/useDayStore';

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

// ── Stat card ──────────────────────────────────────────────────────────
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
    className={[
      'flex flex-col gap-3 p-4 sm:p-5 rounded-2xl border bg-[#1a1a1a]',
      border,
    ].join(' ')}
  >
    <div
      className={[
        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
        bg,
      ].join(' ')}
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

// ── Barra de progreso ──────────────────────────────────────────────────
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
          className={[
            'h-1.5 rounded-full transition-all duration-700',
            color,
          ].join(' ')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ── Home ───────────────────────────────────────────────────────────────
const AdminHome = () => {
  const {
    participants,
    meta,
    fetchParticipants,
    loading: loadingP,
    stats,
    fetchStats,
  } = useParticipantStore();
  const { preSales, fetchPreSales, loading: loadingPS } = usePreSaleStore();
  const {
    availableSlots,
    fetchAvailableSlots,
    loading: loadingAS,
  } = useAvailableSlotStore();
  const {
    codes,
    meta: codeMeta,
    fetchCodes,
    loading: loadingC,
  } = useDynamicCodeStore();
  const { speakers, fetchSpeakers } = useSpeakerStore();
  const { days, fetchDays } = useDayStore();

  useEffect(() => {
    fetchParticipants(1);
    fetchPreSales();
    fetchAvailableSlots();
    fetchCodes(1);
    fetchSpeakers();
    fetchDays();
    fetchStats();
  }, []);

  // ── Métricas calculadas ──────────────────────────────────────────────
  const totalParticipants = meta?.count ?? 0;
  const validatedParticipants = participants.filter(
    (p) => p.is_validated,
  ).length;

  const totalSlots = availableSlots.reduce(
    (acc, s) => acc + (s.amount ?? 0),
    0,
  );

  const availableCodes = codes.filter((c) => c.status === 'Disponible').length;
  const usedCodes = codes.filter((c) => c.status !== 'Disponible').length;
  const totalCodes = codeMeta?.count ?? codes.length;

  const activePreSale = preSales.find((p) => p.is_active);

  return (
    <div className='bg-[#111] min-h-screen px-4 sm:px-6 md:px-8 py-8 sm:py-10 space-y-6 sm:space-y-10'>
      {/* ── Bienvenida ─────────────────────────────────────────────── */}
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

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
        <StatCard
          label='Participantes'
          value={totalParticipants}
          sub={`${validatedParticipants} validados`}
          icon={Users}
          color='text-purple-400'
          bg='bg-purple-400/10'
          border='border-purple-400/20'
          loading={loadingP}
        />
        <StatCard
          label='Cupos totales'
          value={totalSlots}
          sub={`${availableSlots.length} categorías`}
          icon={Ticket}
          color='text-pink-400'
          bg='bg-pink-400/10'
          border='border-pink-400/20'
          loading={loadingAS}
        />
        <StatCard
          label='Speakers'
          value={speakers.length}
          sub='registrados'
          icon={Mic2}
          color='text-green-400'
          bg='bg-green-400/10'
          border='border-green-400/20'
        />
        <StatCard
          label='Días del congreso'
          value={days.length}
          sub='programados'
          icon={CalendarDays}
          color='text-[#fbba0e]'
          bg='bg-[#fbba0e]/10'
          border='border-[#fbba0e]/20'
        />
      </div>

      {/* ── Fila de paneles ────────────────────────────────────────── */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
        {/* Validaciones */}
        <div className='rounded-2xl border border-white/10 bg-[#1a1a1a] p-5 space-y-4'>
          <div className='flex items-center gap-2'>
            <TrendingUp className='w-4 h-4 text-[#fbba0e]' />
            <p className='text-sm font-bold text-slate-200'>
              Estado de validaciones
            </p>
          </div>
          {loadingP ? (
            <div className='space-y-3'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='h-8 rounded bg-white/5 animate-pulse' />
              ))}
            </div>
          ) : (
            <div className='space-y-3'>
              <ProgressBar
                label='Validados'
                value={stats?.validated ?? 0}
                total={stats?.total ?? 0}
                color='bg-green-500'
              />
              <ProgressBar
                label='Pendientes'
                value={stats?.pending ?? 0}
                total={stats?.total ?? 0}
                color='bg-yellow-500'
              />
              <div className='pt-2 flex items-center justify-between text-xs text-slate-500'>
                <span>Total: {stats?.total ?? 0} participantes</span>
                <Link
                  to='/participant'
                  className='text-[#fbba0e] hover:underline font-semibold'
                >
                  Ver todos
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Códigos dinámicos */}
        <div className='rounded-2xl border border-white/10 bg-[#1a1a1a] p-5 space-y-4'>
          <div className='flex items-center gap-2'>
            <Barcode className='w-4 h-4 text-rose-400' />
            <p className='text-sm font-bold text-slate-200'>
              Códigos generales
            </p>
          </div>
          {loadingC ? (
            <div className='space-y-3'>
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className='h-10 rounded bg-white/5 animate-pulse'
                />
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
                  {availableCodes}
                </span>
              </div>
              <div className='flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/20'>
                <div className='flex items-center gap-2'>
                  <XCircle className='w-4 h-4 text-red-400' />
                  <span className='text-xs text-slate-400'>Usados</span>
                </div>
                <span className='text-lg font-black text-red-400'>
                  {usedCodes}
                </span>
              </div>
              <ProgressBar
                label='Uso total'
                value={usedCodes}
                total={totalCodes}
                color='bg-rose-500'
              />
            </div>
          )}
        </div>

        {/* Preventa activa */}
        <div className='rounded-2xl border border-white/10 bg-[#1a1a1a] p-5 space-y-4'>
          <div className='flex items-center gap-2'>
            <Clock className='w-4 h-4 text-teal-400' />
            <p className='text-sm font-bold text-slate-200'>Preventa activa</p>
          </div>
          {loadingPS ? (
            <div className='h-24 rounded bg-white/5 animate-pulse' />
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
              <div className='space-y-2'>
                {availableSlots.slice(0, 3).map((slot) => (
                  <div
                    key={slot.id}
                    className='flex items-center justify-between text-xs'
                  >
                    <span className='text-slate-400'>
                      {slot.quota_type?.name ?? `Cupo ${slot.id}`}
                    </span>
                    <span className='text-slate-200 font-semibold'>
                      {slot.amount} cupos
                    </span>
                  </div>
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
                  className={[
                    'w-9 h-9 rounded-xl flex items-center justify-center border',
                    mod.bg,
                    mod.border,
                  ].join(' ')}
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
                <ChevronRight
                  className={[
                    'w-3.5 h-3.5 transition-all duration-200 text-slate-600',
                    'group-hover:translate-x-1',
                  ].join(' ')}
                />
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
