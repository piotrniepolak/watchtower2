import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Pill, Target, TrendingUp, BarChart3, Clock, Award } from "lucide-react";
import MultiSectorNavigation from "@/components/multi-sector-navigation";

export default function ResearchIntel() {
  const [currentSector] = useState("health");

  const { data: healthStocks = [] } = useQuery({
    queryKey: ["/api/sectors/health/stocks"],
  });

  const researchPipeline = [
    {
      company: "Pfizer",
      drug: "PF-07321332 (Paxlovid)",
      indication: "COVID-19 Treatment",
      phase: "Approved",
      status: "Commercialized",
      marketPotential: "$22B",
      probability: 95,
      timeline: "Launched 2021"
    },
    {
      company: "Moderna",
      drug: "mRNA-1273.214",
      indication: "COVID-19 Bivalent Booster",
      phase: "Phase III",
      status: "FDA Approved",
      marketPotential: "$8B",
      probability: 90,
      timeline: "Q1 2025"
    },
    {
      company: "Johnson & Johnson",
      drug: "JNJ-4528",
      indication: "Multiple Myeloma",
      phase: "Phase II",
      status: "Active",
      marketPotential: "$3.2B",
      probability: 65,
      timeline: "2026-2027"
    },
    {
      company: "Gilead",
      drug: "GS-6207 (Lenacapavir)",
      indication: "HIV Treatment",
      phase: "Approved",
      status: "Commercialized",
      marketPotential: "$4.5B",
      probability: 95,
      timeline: "Launched 2022"
    },
    {
      company: "Regeneron",
      drug: "REGN-COV2",
      indication: "COVID-19 Treatment",
      phase: "Approved",
      status: "Commercialized",
      marketPotential: "$2.8B",
      probability: 95,
      timeline: "Launched 2020"
    }
  ];

  const clinicalTrials = [
    {
      sponsor: "Pfizer",
      title: "Phase III Study of PF-06928316 in Advanced Solid Tumors",
      indication: "Oncology",
      enrollment: 450,
      completion: "2025-12-01",
      primaryEndpoint: "Overall Survival"
    },
    {
      sponsor: "Moderna",
      title: "mRNA-4157 Personalized Cancer Vaccine Study",
      indication: "Melanoma",
      enrollment: 300,
      completion: "2025-09-15",
      primaryEndpoint: "Recurrence-Free Survival"
    },
    {
      sponsor: "Amgen",
      title: "AMG 510 in KRAS G12C Mutated Tumors",
      indication: "Lung Cancer",
      enrollment: 200,
      completion: "2025-06-30",
      primaryEndpoint: "Objective Response Rate"
    }
  ];

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Approved': return 'default';
      case 'Phase III': return 'secondary';
      case 'Phase II': return 'outline';
      case 'Phase I': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-100">
      <MultiSectorNavigation currentSector={currentSector} onSectorChange={() => {}} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Research Intelligence</h1>
              <p className="text-slate-600">Pharmaceutical R&D pipeline analysis and clinical trial monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">127</div>
                    <div className="text-xs text-muted-foreground">Active Trials</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">23</div>
                    <div className="text-xs text-muted-foreground">FDA Approvals</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="pipeline" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pipeline">Drug Pipeline</TabsTrigger>
              <TabsTrigger value="trials">Clinical Trials</TabsTrigger>
              <TabsTrigger value="intelligence">Market Intelligence</TabsTrigger>
              <TabsTrigger value="forecasts">Success Forecasts</TabsTrigger>
            </TabsList>

            <TabsContent value="pipeline">
              <div className="space-y-6">
                {researchPipeline.map((drug, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <Pill className="h-5 w-5 text-green-600" />
                            <span>{drug.drug}</span>
                          </CardTitle>
                          <CardDescription>{drug.company} • {drug.indication}</CardDescription>
                        </div>
                        <Badge variant={getPhaseColor(drug.phase) as any}>
                          {drug.phase}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm font-medium">Market Potential</div>
                          <div className="text-lg font-bold text-green-600">{drug.marketPotential}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Success Probability</div>
                          <div className="text-lg font-bold">{drug.probability}%</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Timeline</div>
                          <div className="text-sm text-muted-foreground">{drug.timeline}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Status</div>
                          <Badge variant="outline" className={`text-xs ${
                            drug.status === 'Commercialized' ? 'text-green-600' :
                            drug.status === 'FDA Approved' ? 'text-blue-600' :
                            'text-orange-600'
                          }`}>
                            {drug.status}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Development Progress</span>
                          <span>{drug.probability}%</span>
                        </div>
                        <Progress value={drug.probability} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trials">
              <div className="space-y-6">
                {clinicalTrials.map((trial, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        <span className="text-sm">{trial.title}</span>
                      </CardTitle>
                      <CardDescription>{trial.sponsor} • {trial.indication}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm font-medium">Enrollment</div>
                          <div className="text-lg font-bold">{trial.enrollment} patients</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Primary Endpoint</div>
                          <div className="text-sm text-muted-foreground">{trial.primaryEndpoint}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Completion</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{trial.completion}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="intelligence">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span>Therapeutic Areas</span>
                    </CardTitle>
                    <CardDescription>R&D investment by indication</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Oncology</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-red-600 h-2 rounded-full" style={{width: '85%'}}></div>
                          </div>
                          <span className="text-sm font-medium">$89B</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Infectious Disease</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
                          </div>
                          <span className="text-sm font-medium">$45B</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Neurology</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{width: '55%'}}></div>
                          </div>
                          <span className="text-sm font-medium">$38B</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Cardiovascular</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{width: '45%'}}></div>
                          </div>
                          <span className="text-sm font-medium">$31B</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      <span>Pipeline Metrics</span>
                    </CardTitle>
                    <CardDescription>Development stage distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Preclinical</span>
                        <Badge variant="outline">2,845 programs</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Phase I</span>
                        <Badge variant="outline">892 trials</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Phase II</span>
                        <Badge variant="outline">456 trials</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Phase III</span>
                        <Badge variant="outline">127 trials</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Regulatory Review</span>
                        <Badge variant="outline">34 submissions</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="forecasts">
              <Card>
                <CardHeader>
                  <CardTitle>Success Probability Forecasts</CardTitle>
                  <CardDescription>AI-powered success predictions for late-stage trials</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-green-600">78%</div>
                      <div className="text-sm text-muted-foreground">Phase III Success Rate</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">62%</div>
                      <div className="text-sm text-muted-foreground">Regulatory Approval Rate</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-orange-600">$2.4B</div>
                      <div className="text-sm text-muted-foreground">Avg Development Cost</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}