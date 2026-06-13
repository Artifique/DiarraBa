"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Bird, 
  Package, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { 
  getDashboardDataAction,
  checkAndGenerateNotificationsAction,
  getDashboardChartDataAction
} from "../../actions/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Stat = {
  name: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  icon: LucideIcon;
  color: string;
  bg: string;
};

const CHART_COLORS = ['#F5A623', '#10B981', '#60A5FA', '#A78BFA', '#F472B6', '#FBBF24'];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stat[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [chartMode, setChartMode] = useState<'week' | 'month' | 'year'>('week');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [chartData, setChartData] = useState<any[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        const userId = user?.id;

        const { globalStats, distribution, recentActivities } = await getDashboardDataAction();

        if (userId) {
          await checkAndGenerateNotificationsAction(userId);
        }

        setStats([
          {
            name: "Chiffre d'affaires",
            value: `${globalStats.totalCA.toLocaleString()} FCFA`,
            trend: "+12.5%", 
            trendUp: true,
            icon: TrendingUp,
            color: "text-orange-accent",
            bg: "bg-orange-accent/10",
          },
          {
            name: "Produits disponibles",
            value: globalStats.produitsCount,
            trend: "+5.2%",
            trendUp: true,
            icon: Bird,
            color: "text-forest-green",
            bg: "bg-forest-green/10",
          },
            {
              name: "Réservations non payées",
              value: globalStats.unpaidReservationsCount,
              trend: "-2.4%",
              trendUp: false,
              icon: Package,
              color: "text-blue-400",
              bg: "bg-blue-400/10",
            },
          {
            name: "Éclosions actives",
            value: globalStats.activeEclosionsCount,
            trend: "+4.1%",
            trendUp: true,
            icon: Activity,
            color: "text-purple-400",
            bg: "bg-purple-400/10",
          },
        ]);

        setDistributionData(distribution);
        setActivities(recentActivities);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoadingChart(true);
      try {
        const data = await getDashboardChartDataAction(chartMode, selectedYear, selectedMonth);
        setChartData(data);
      } catch (error) {
        console.error("Error loading chart data:", error);
      } finally {
        setLoadingChart(false);
      }
    };

    fetchChartData();
  }, [chartMode, selectedYear, selectedMonth]);

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-8 p-2 md:p-0">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
      >
        {stats.map((stat) => (
          <motion.div 
            key={stat.name}
            variants={item}
            className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-orange-accent/30 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className={cn(stat.bg, "p-3 rounded-xl", stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className={cn(
                "flex items-center text-[10px] font-bold px-2 py-1 rounded-full",
                stat.trendUp ? "bg-forest-green/10 text-forest-green" : "bg-destructive/10 text-destructive"
              )}>
                {stat.trendUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                {stat.trend}
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{stat.name}</p>
              <p className="text-2xl font-mono font-bold text-white mt-1">{stat.value}</p>
            </div>

            <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <stat.icon size={100} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card p-6 rounded-2xl h-[400px] flex flex-col"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-display font-semibold text-white">Activité Financière & Opérations</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Suivi des réservations et éclosions</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                {(['week', 'month', 'year'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setChartMode(m)}
                    className={cn(
                      "px-3 py-1 text-[10px] sm:text-xs font-bold rounded-lg transition-colors cursor-pointer capitalize",
                      chartMode === m 
                        ? "bg-orange-accent text-night" 
                        : "text-muted-foreground hover:text-white"
                    )}
                  >
                    {m === 'week' ? 'Semaine' : m === 'month' ? 'Mois' : 'Année'}
                  </button>
                ))}
              </div>

              {chartMode === 'month' && (
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(v) => setSelectedMonth(Number(v))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 h-8 text-[10px] sm:text-xs rounded-xl w-28">
                    <SelectValue placeholder="Mois" />
                  </SelectTrigger>
                  <SelectContent className="bg-night border-white/10">
                    {["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"].map((m, idx) => (
                      <SelectItem key={idx} value={idx.toString()}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {(chartMode === 'month' || chartMode === 'year') && (
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(v) => setSelectedYear(Number(v))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 h-8 text-[10px] sm:text-xs rounded-xl w-20">
                    <SelectValue placeholder="Année" />
                  </SelectTrigger>
                  <SelectContent className="bg-night border-white/10">
                    {[selectedYear - 1, selectedYear, selectedYear + 1].map((y) => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          <div className="flex-1 w-full relative">
            {loadingChart && (
              <div className="absolute inset-0 bg-night/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-accent"></div>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorReservations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F5A623" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEclosions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#A78BFA" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(val) => val >= 1000 ? `${val / 1000}k` : val}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0B10', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ fontWeight: 'bold', fontSize: '11px' }}
                  labelStyle={{ fontSize: '11px', color: '#94a3b8' }}
                  formatter={(value: any, name: any) => {
                    const label = name === 'reservations' ? 'Réservations' : name === 'eclosions' ? 'Éclosions' : name;
                    return [`${Number(value).toLocaleString()} FCFA`, label];
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '10px', paddingBottom: '8px', color: '#94a3b8' }}
                  formatter={(value) => value === 'reservations' ? 'Réservations' : 'Éclosions'}
                />
                <Area 
                  type="monotone" 
                  dataKey="reservations" 
                  stackId="1"
                  stroke="#F5A623" 
                  fillOpacity={1} 
                  fill="url(#colorReservations)" 
                  strokeWidth={2}
                  name="reservations"
                />
                <Area 
                  type="monotone" 
                  dataKey="eclosions" 
                  stackId="1"
                  stroke="#A78BFA" 
                  fillOpacity={1} 
                  fill="url(#colorEclosions)" 
                  strokeWidth={2}
                  name="eclosions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 rounded-2xl h-[400px] flex flex-col"
        >
          <h3 className="text-lg font-display font-semibold text-white mb-6">Répartition par type</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="rgba(255,255,255,0.05)" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0B10', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }}
                  formatter={(value) => <span className="text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6 rounded-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-display font-semibold text-white">Activités Récentes</h3>
          <button className="text-xs text-orange-accent hover:underline">Voir tout</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="pb-4 font-semibold">Client</th>
                <th className="pb-4 font-semibold">Date</th>
                <th className="pb-4 font-semibold">Montant</th>
                <th className="pb-4 font-semibold">Statut</th>
                <th className="pb-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {activities.map((res) => (
                <tr key={res.id} className="border-b border-white/5 last:border-0 group hover:bg-white/[0.02] transition-colors">
                  <td className="py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-orange-accent/20 flex items-center justify-center text-[10px] font-bold text-orange-accent mr-3">
                        {res.client.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{res.client}</p>
                        <p className="text-[10px] text-muted-foreground">ID: {res.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-muted-foreground text-xs">
                    {new Date(res.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-4 font-mono font-medium text-white">{res.montant.toLocaleString()} FCFA</td>
                  <td className="py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold",
                      res.statut === "EnAttente" ? "bg-orange-accent/10 text-orange-accent" :
                      res.statut === "Confirmee" ? "bg-forest-green/10 text-forest-green" :
                      "bg-blue-400/10 text-blue-400"
                    )}>
                      {res.statut}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button className="text-white/40 hover:text-white transition-colors text-xs font-medium">Détails</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
