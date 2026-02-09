"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, Button, Input } from "@/components/ui"
import { 
  Search, Filter, Play, BookOpen, Star, Clock, 
  ChevronRight, Heart, Brain, Palette, Activity,
  MessageCircle, Calculator, Compass, Globe, User, Hand
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

// Activity data - örnek aktiviteler
const activities = [
  {
    id: "1",
    title: "Hikaye Zamani",
    description: "Resimli kitaplarla hikaye anlatimi ve dinleme aktivitesi",
    domain: "language_communication",
    domainName: "Dil ve Iletisim",
    ageGroup: "3-4",
    duration: 20,
    difficulty: "easy",
    materials: ["Resimli kitap", "Yastiklar"],
    steps: ["Cocuklari halka seklinde oturtun", "Kitabi gostererek okuyun", "Sorular sorun"],
    color: "#10B981",
  },
  {
    id: "2",
    title: "Sekil Avi",
    description: "Sinifta geometrik sekilleri bulma oyunu",
    domain: "logical_numerical",
    domainName: "Mantiksal Muhakeme",
    ageGroup: "4-5",
    duration: 15,
    difficulty: "medium",
    materials: ["Sekil kartlari", "Sepet"],
    steps: ["Sekilleri tanitin", "Sinifta arayin", "Sepete koyun"],
    color: "#06B6D4",
  },
  {
    id: "3",
    title: "Parmak Boyasi Sanati",
    description: "Parmak boyalariyla serbest resim calismasi",
    domain: "creative_expression",
    domainName: "Yaratici Ifade",
    ageGroup: "3-5",
    duration: 30,
    difficulty: "easy",
    materials: ["Parmak boyasi", "Buyuk kagit", "Onluk"],
    steps: ["Onlukleri giydirin", "Boyalari dagitin", "Serbest cizim"],
    color: "#EC4899",
  },
  {
    id: "4",
    title: "Denge Parkuru",
    description: "Cesitli malzemelerle denge ve koordinasyon parkuru",
    domain: "gross_motor",
    domainName: "Kaba Motor",
    ageGroup: "4-6",
    duration: 25,
    difficulty: "medium",
    materials: ["Denge tahtasi", "Halkalar", "Koniler"],
    steps: ["Parkuru kurun", "Gosterin", "Sirayla deneyin"],
    color: "#EF4444",
  },
  {
    id: "5",
    title: "Duygu Kartlari",
    description: "Duygulari tanima ve ifade etme oyunu",
    domain: "social_emotional",
    domainName: "Sosyal Duygusal",
    ageGroup: "3-5",
    duration: 20,
    difficulty: "easy",
    materials: ["Duygu kartlari", "Ayna"],
    steps: ["Kartlari gosterin", "Duyguyu adlandirin", "Yuz ifadesi yapin"],
    color: "#F59E0B",
  },
  {
    id: "6",
    title: "Boncuk Dizme",
    description: "Ince motor becerileri gelistiren boncuk dizme aktivitesi",
    domain: "fine_motor",
    domainName: "Ince Motor",
    ageGroup: "4-5",
    duration: 20,
    difficulty: "medium",
    materials: ["Buyuk boncuklar", "Ip", "Tepsi"],
    steps: ["Malzemeleri hazirlayin", "Ornek gosterin", "Dizdirin"],
    color: "#8B5CF6",
  },
  {
    id: "7",
    title: "Doga Yuruyusu",
    description: "Bahcede doga kesfi ve gozlem aktivitesi",
    domain: "discovery_world",
    domainName: "Dunya Kesfi",
    ageGroup: "3-6",
    duration: 30,
    difficulty: "easy",
    materials: ["Buyutec", "Toplama kutusu"],
    steps: ["Bahceye cikin", "Gozlem yapin", "Bulgularinizi paylasin"],
    color: "#84CC16",
  },
  {
    id: "8",
    title: "Hafiza Oyunu",
    description: ["Eslestirme kartlariyla hafiza gelistirme oyunu"],
    domain: "executive_functions",
    domainName: "Yurutucu Islevler",
    ageGroup: "4-6",
    duration: 15,
    difficulty: "medium",
    materials: ["Eslestirme kartlari"],
    steps: ["Kartlari yerlestirin", "Kurallari anlatin", "Sirayla oynayin"],
    color: "#3B82F6",
  },
]

const domainIcons: Record<string, any> = {
  language_communication: MessageCircle,
  logical_numerical: Calculator,
  creative_expression: Palette,
  gross_motor: Activity,
  social_emotional: Heart,
  fine_motor: Hand,
  discovery_world: Globe,
  executive_functions: Brain,
  spatial_awareness: Compass,
  self_help: User,
}

const domains = [
  { id: "all", name: "Tumu", color: "#6B7280" },
  { id: "language_communication", name: "Dil", color: "#10B981" },
  { id: "logical_numerical", name: "Mantik", color: "#06B6D4" },
  { id: "creative_expression", name: "Yaratici", color: "#EC4899" },
  { id: "gross_motor", name: "Motor", color: "#EF4444" },
  { id: "social_emotional", name: "Sosyal", color: "#F59E0B" },
  { id: "fine_motor", name: "Ince Motor", color: "#8B5CF6" },
  { id: "discovery_world", name: "Kesif", color: "#84CC16" },
  { id: "executive_functions", name: "Bilissel", color: "#3B82F6" },
]

export default function ParentActivitiesPage() {
  const [search, setSearch] = useState("")
  const [selectedDomain, setSelectedDomain] = useState("all")
  const [selectedActivity, setSelectedActivity] = useState<typeof activities[0] | null>(null)

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = activity.title.toLowerCase().includes(search.toLowerCase()) ||
                           (typeof activity.description === 'string' && activity.description.toLowerCase().includes(search.toLowerCase()))
      const matchesDomain = selectedDomain === "all" || activity.domain === selectedDomain
      return matchesSearch && matchesDomain
    })
  }, [search, selectedDomain])

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case "easy": return { label: "Kolay", color: "bg-green-100 text-green-700" }
      case "medium": return { label: "Orta", color: "bg-amber-100 text-amber-700" }
      case "hard": return { label: "Zor", color: "bg-red-100 text-red-700" }
      default: return { label: "Kolay", color: "bg-green-100 text-green-700" }
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-stone-800">
          Aktivite Kutuphanesi
        </h1>
        <p className="text-stone-500 mt-1">
          Cocugunuzla evde yapabileceginiz aktiviteler
        </p>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
          <Input
            placeholder="Aktivite ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 rounded-xl"
          />
        </div>

        {/* Domain Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {domains.map((domain) => (
            <button
              key={domain.id}
              onClick={() => setSelectedDomain(domain.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedDomain === domain.id
                  ? "text-white shadow-md"
                  : "bg-white text-stone-600 hover:bg-stone-100"
              }`}
              style={{
                backgroundColor: selectedDomain === domain.id ? domain.color : undefined,
              }}
            >
              {domain.name}
            </button>
          ))}
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredActivities.map((activity, index) => {
            const Icon = domainIcons[activity.domain] || BookOpen
            const difficulty = getDifficultyLabel(activity.difficulty)
            const desc = typeof activity.description === 'string' ? activity.description : activity.description[0]
            
            return (
              <motion.div
                key={activity.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="parent-card cursor-pointer hover:shadow-soft-lg transition-all group"
                  onClick={() => setSelectedActivity(activity)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div 
                        className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${activity.color}20` }}
                      >
                        <Icon className="h-6 w-6" style={{ color: activity.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-stone-800 group-hover:text-brand-600 transition-colors">
                          {activity.title}
                        </h3>
                        <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                          {desc}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-3">
                          <span className="flex items-center gap-1 text-xs text-stone-500">
                            <Clock className="h-3 w-3" />
                            {activity.duration} dk
                          </span>
                          <span className="flex items-center gap-1 text-xs text-stone-500">
                            <Star className="h-3 w-3" />
                            {activity.ageGroup} yas
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${difficulty.color}`}>
                            {difficulty.label}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-stone-300 group-hover:text-brand-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-stone-300 mb-3" />
          <p className="text-stone-500">Bu kriterlere uygun aktivite bulunamadi</p>
        </div>
      )}

      {/* Activity Detail Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setSelectedActivity(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div 
                className="p-6 text-white rounded-t-3xl md:rounded-t-3xl"
                style={{ backgroundColor: selectedActivity.color }}
              >
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center">
                    {(() => {
                      const Icon = domainIcons[selectedActivity.domain] || BookOpen
                      return <Icon className="h-7 w-7 text-white" />
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedActivity.title}</h2>
                    <p className="text-white/80 text-sm mt-1">{selectedActivity.domainName}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                <p className="text-stone-600">
                  {typeof selectedActivity.description === 'string' ? selectedActivity.description : selectedActivity.description[0]}
                </p>

                {/* Meta */}
                <div className="flex gap-4">
                  <div className="flex-1 bg-stone-50 rounded-xl p-3 text-center">
                    <Clock className="h-5 w-5 mx-auto text-stone-400 mb-1" />
                    <p className="text-sm font-medium text-stone-800">{selectedActivity.duration} dk</p>
                    <p className="text-xs text-stone-500">Sure</p>
                  </div>
                  <div className="flex-1 bg-stone-50 rounded-xl p-3 text-center">
                    <Star className="h-5 w-5 mx-auto text-stone-400 mb-1" />
                    <p className="text-sm font-medium text-stone-800">{selectedActivity.ageGroup} yas</p>
                    <p className="text-xs text-stone-500">Yas Grubu</p>
                  </div>
                  <div className="flex-1 bg-stone-50 rounded-xl p-3 text-center">
                    <Activity className="h-5 w-5 mx-auto text-stone-400 mb-1" />
                    <p className="text-sm font-medium text-stone-800">{getDifficultyLabel(selectedActivity.difficulty).label}</p>
                    <p className="text-xs text-stone-500">Zorluk</p>
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <h3 className="font-semibold text-stone-800 mb-2">Malzemeler</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedActivity.materials.map((material, i) => (
                      <span key={i} className="px-3 py-1 bg-stone-100 rounded-full text-sm text-stone-600">
                        {material}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <h3 className="font-semibold text-stone-800 mb-2">Adimlar</h3>
                  <div className="space-y-2">
                    {selectedActivity.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span 
                          className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: selectedActivity.color }}
                        >
                          {i + 1}
                        </span>
                        <p className="text-stone-600 text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full h-12 rounded-xl"
                  style={{ backgroundColor: selectedActivity.color }}
                  onClick={() => setSelectedActivity(null)}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Aktiviteye Basla
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
