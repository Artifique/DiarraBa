"use client";

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

type Stat = {
  name: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: LucideIcon;
  color: string;
  bg: string;
};

const stats: Stat[] = [
  {
    name: "Chiffre d'affaires",
    value: "1 250 000 FCFA",
    trend: "+12.5%",
    trendUp: true,
    icon: TrendingUp,
    color: "text-orange-accent",
    bg: "bg-orange-accent/10",
  },
  {
    name: "Volailles disponibles",
    value: "1 450",
    trend: "+5.2%",
    trendUp: true,
    icon: Bird,
    color: "text-forest-green",
    bg: "bg-forest-green/10",
  },
  {
    name: "Réservations en cours",
    value: "42",
    trend: "-2.4%",
    trendUp: false,
    icon: Package,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    name: "Couveuses actives",
    value: "85%",
    trend: "+4.1%",
    trendUp: true,
    icon: Activity,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function DashboardPage() {
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
              <div className={stat.bg + " p-3 rounded-xl " + stat.color}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className={`flex items-center text-[10px] font-bold px-2 py-1 rounded-full ${stat.trendUp ? 'bg-forest-green/10 text-forest-green' : 'bg-destructive/10 text-destructive'}`}>
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
                Ventes
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center border border-white/5 rounded-xl bg-white/5">
            <p className="text-muted-foreground text-sm italic">Graphique Recharts à venir...</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 rounded-2xl h-[400px] flex flex-col"
        >
          <h3 className="text-lg font-display font-semibold text-white mb-6">Répartition par type</h3>
          <div className="flex-1 flex items-center justify-center border border-white/5 rounded-xl bg-white/5">
            <p className="text-muted-foreground text-sm italic">Graphique Donut à venir...</p>
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
                <th className="pb-4 font-semibold">Type</th>
                <th className="pb-4 font-semibold">Montant</th>
                <th className="pb-4 font-semibold">Statut</th>
                <th className="pb-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-white/5 last:border-0 group hover:bg-white/[0.02] transition-colors">
                  <td className="py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-orange-accent/20 flex items-center justify-center text-[10px] font-bold text-orange-accent mr-3">
                        CB
                      </div>
                      <div>
                        <p className="font-medium text-white">Client #{i}</p>
                        <p className="text-[10px] text-muted-foreground">ID: RES-2024-00{i}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-muted-foreground text-xs">Poussins (500)</td>
                  <td className="py-4 font-mono font-medium text-white">75 000 FCFA</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${i % 3 === 0 ? 'bg-orange-accent/10 text-orange-accent' : i % 3 === 1 ? 'bg-forest-green/10 text-forest-green' : 'bg-blue-400/10 text-blue-400'}`}>
                      {i % 3 === 0 ? 'En Attente' : i % 3 === 1 ? 'Confirmée' : 'Livrée'}
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
