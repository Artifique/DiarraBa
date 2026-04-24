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
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { createClient } from "@/lib/supabase";
import { DashboardService } from "@/lib/services/dashboard.service";
import { notificationService } from "@/lib/services";
import { ManagerModel } from "@/lib/models/manager.model";
import { cn } from "@/lib/utils";

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
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        const service = new DashboardService(supabase);
        const managerModel = new ManagerModel(supabase);

        const [globalStats, distribution, history, recent, managerData] = await Promise.all([
          service.getGlobalStats(),
          service.getPoultryDistribution(),
          service.getRevenueHistory(),
          service.getRecentActivities(),
          managerModel.findFirst()
        ]);

        if (managerData) {
          await notificationService.checkAndGenerateNotifications(managerData.id);
        }

        setStats([
          {
            name: "Chiffre d'affaires",
            value: `${globalStats.totalCA.toLocaleString()} FCFA`,
            trend: "+12.5%", // Mock trend for now
            trendUp: true,
            icon: TrendingUp,
            color: "text-orange-accent",
            bg: "bg-orange-accent/10",
          },
          {
            name: "Volailles disponibles",
            value: globalStats.volaillesCount,
            trend: "+5.2%",
            trendUp: true,
            icon: Bird,
            color: "text-forest-green",
            bg: "bg-forest-green/10",
          },
          {
            name: "Réservations en cours",
            value: globalStats.reservationsCount,
            trend: "-2.4%",
            trendUp: false,
            icon: Package,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
          },
          {
            name: "Couveuses actives",
            value: `${globalStats.occupancyRate}%`,
            trend: "+4.1%",
            trendUp: true,
            icon: Activity,
            color: "text-purple-400",
            bg: "bg-purple-400/10",
          },
        ]);

        setDistributionData(distribution);
        setRevenueData(history);
        setActivities(recent);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
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
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-display font-semibold text-white">Revenus des 6 derniers mois</h3>
            <div className="flex gap-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-orange-accent mr-2" />
                Ventes (FCFA)
              </div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F5A623" stopOpacity={0}/>
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
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0B10', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#F5A623', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#F5A623" 
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                  strokeWidth={2}
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
