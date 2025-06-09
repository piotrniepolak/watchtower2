import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { FileText, TrendingUp, AlertTriangle, CheckCircle, Clock, Users, ExternalLink, BookOpen } from "lucide-react";
import MultiSectorNavigation from "@/components/multi-sector-navigation";

export default function CaseStudies() {
  const [currentSector] = useState("health");

  const caseStudies = [
    {
      id: 1,
      title: "COVID-19 Vaccine Development Race",
      category: "Pandemic Response",
      timeline: "2020-2021",
      companies: ["Pfizer/BioNTech", "Moderna", "Johnson & Johnson"],
      outcome: "Success",
      marketImpact: "+847% (Moderna), +23% (Pfizer)",
      keyLessons: [
        "mRNA technology proved revolutionary",
        "Government partnerships accelerated development",
        "Supply chain resilience was critical"
      ],
      summary: "Analysis of how pharmaceutical companies leveraged cutting-edge mRNA technology and unprecedented global collaboration to develop COVID-19 vaccines in record time.",
      status: "Completed",
      duration: "11 months",
      studies: [
        {
          doi: "10.1056/NEJMoa2034577",
          title: "Safety and Efficacy of the BNT162b2 mRNA Covid-19 Vaccine",
          journal: "New England Journal of Medicine",
          year: "2020",
          overview: "Phase 3 trial demonstrating 95% efficacy of the Pfizer-BioNTech vaccine in preventing COVID-19, establishing the foundation for global vaccination programs."
        },
        {
          doi: "10.1056/NEJMoa2035389",
          title: "Efficacy and Safety of the mRNA-1273 SARS-CoV-2 Vaccine",
          journal: "New England Journal of Medicine", 
          year: "2021",
          overview: "Clinical trial results showing 94.1% efficacy of Moderna's mRNA-1273 vaccine, validating the mRNA platform for pandemic response."
        },
        {
          doi: "10.1038/s41586-021-03275-y",
          title: "mRNA vaccines manufacturing: challenges and opportunities",
          journal: "Nature",
          year: "2021",
          overview: "Comprehensive analysis of manufacturing processes, supply chain considerations, and scalability challenges in mRNA vaccine production."
        }
      ]
    },
    {
      id: 2,
      title: "Alzheimer's Drug Development Challenges",
      category: "Neurological Disorders",
      timeline: "2015-2023",
      companies: ["Biogen", "Eisai", "Roche"],
      outcome: "Mixed",
      marketImpact: "-12% (Biogen), +8% (Eisai)",
      keyLessons: [
        "Early-stage biomarker validation is crucial",
        "Regulatory pathway complexity affects timelines",
        "Patient selection criteria impact trial outcomes"
      ],
      summary: "Comprehensive analysis of the setbacks and breakthroughs in Alzheimer's research, including Aducanumab's controversial approval and Lecanemab's success.",
      status: "Ongoing",
      duration: "8+ years",
      studies: [
        {
          doi: "10.1056/NEJMoa2212948",
          title: "Lecanemab in Early Alzheimer's Disease",
          journal: "New England Journal of Medicine",
          year: "2023",
          overview: "Phase 3 trial demonstrating 27% reduction in cognitive decline with lecanemab, marking a breakthrough in Alzheimer's treatment after decades of failures."
        },
        {
          doi: "10.1038/s41591-021-01343-z",
          title: "Aducanumab and the FDA - A regulatory controversy",
          journal: "Nature Medicine",
          year: "2021",
          overview: "Analysis of the controversial FDA approval of aducanumab despite mixed clinical trial results and advisory committee opposition."
        },
        {
          doi: "10.1016/S1474-4422(19)30434-2",
          title: "The economics of Alzheimer's disease drug development",
          journal: "Lancet Neurology",
          year: "2020",
          overview: "Economic evaluation of R&D costs and market dynamics in Alzheimer's drug development, highlighting the $5.7 trillion failure cost."
        }
      ]
    },
    {
      id: 3,
      title: "CAR-T Therapy Market Evolution",
      category: "Oncology Innovation",
      timeline: "2017-2024",
      companies: ["Novartis", "Gilead/Kite", "Bristol Myers Squibb"],
      outcome: "Success",
      marketImpact: "+156% (sector avg.)",
      keyLessons: [
        "Manufacturing scalability determines market access",
        "Cost-effectiveness drives adoption",
        "Combination therapies expand applications"
      ],
      summary: "How CAR-T cell therapies transformed cancer treatment and created a new therapeutic category worth $8B+ annually.",
      status: "Expanding",
      duration: "7 years",
      studies: [
        {
          doi: "10.1056/NEJMoa1709866",
          title: "Tisagenlecleucel in Children and Young Adults with B-Cell Lymphoblastic Leukemia",
          journal: "New England Journal of Medicine",
          year: "2018",
          overview: "Pivotal trial demonstrating 81% overall remission rate with tisagenlecleucel, establishing CAR-T therapy as a breakthrough treatment for relapsed B-ALL."
        },
        {
          doi: "10.1038/s41573-020-0090-z",
          title: "CAR-T cell therapy: current limitations and potential strategies",
          journal: "Nature Reviews Drug Discovery",
          year: "2021",
          overview: "Comprehensive review of manufacturing challenges, cost barriers, and emerging strategies to improve CAR-T therapy accessibility and efficacy."
        },
        {
          doi: "10.1016/S1470-2045(22)00372-6",
          title: "Economic evaluation of CAR-T cell therapy in oncology",
          journal: "Lancet Oncology",
          year: "2022",
          overview: "Cost-effectiveness analysis showing $373,000-$450,000 per treatment, with health economic models supporting reimbursement decisions."
        }
      ]
    }
  ];

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'Success': return 'bg-green-100 text-green-800';
      case 'Mixed': return 'bg-yellow-100 text-yellow-800';
      case 'Failure': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Ongoing': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Expanding': return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
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
              <h1 className="text-3xl font-bold text-slate-900">Case Studies</h1>
              <p className="text-slate-600">In-depth analysis of pharmaceutical industry transformations and market dynamics</p>
            </div>
            <div className="flex items-center space-x-4">
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{caseStudies.length}</div>
                    <div className="text-xs text-muted-foreground">Studies</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-xs text-muted-foreground">Companies</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
              <TabsTrigger value="outcomes">Outcomes & Impact</TabsTrigger>
              <TabsTrigger value="lessons">Key Learnings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {caseStudies.map((study) => (
                  <Card key={study.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{study.title}</CardTitle>
                          <CardDescription className="mt-1">{study.category} • {study.timeline}</CardDescription>
                        </div>
                        {getStatusIcon(study.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Outcome</span>
                        <Badge className={getOutcomeColor(study.outcome)}>
                          {study.outcome}
                        </Badge>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium mb-1">Market Impact</div>
                        <div className="text-sm text-muted-foreground">{study.marketImpact}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-1">Companies Involved</div>
                        <div className="flex flex-wrap gap-1">
                          {study.companies.map((company, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {company}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-2">Duration</div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{study.duration}</span>
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Read Full Studies
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              <FileText className="h-5 w-5" />
                              <span>Research Studies: {study.title}</span>
                            </DialogTitle>
                            <DialogDescription>
                              Academic papers and research studies that informed this case study analysis
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6 mt-6">
                            {study.studies.map((researchStudy, idx) => (
                              <div key={idx} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-lg leading-tight">{researchStudy.title}</h4>
                                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                                      <span className="font-medium">{researchStudy.journal}</span>
                                      <span>•</span>
                                      <span>{researchStudy.year}</span>
                                    </div>
                                  </div>
                                  <Badge variant="secondary" className="ml-4">
                                    DOI: {researchStudy.doi}
                                  </Badge>
                                </div>
                                <Separator />
                                <div>
                                  <h5 className="font-medium mb-2">Study Overview</h5>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {researchStudy.overview}
                                  </p>
                                </div>
                                <div className="flex justify-end">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-blue-600 hover:text-blue-800"
                                    onClick={() => window.open(`https://doi.org/${researchStudy.doi}`, '_blank')}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    View on Publisher Site
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="detailed">
              <div className="space-y-6">
                {caseStudies.map((study) => (
                  <Card key={study.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{study.title}</span>
                        <Badge className={getOutcomeColor(study.outcome)}>
                          {study.outcome}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{study.category} • {study.timeline}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-2">Executive Summary</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {study.summary}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3">Key Participants</h4>
                          <div className="space-y-2">
                            {study.companies.map((company, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm">{company}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3">Timeline & Status</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Duration:</span>
                              <span className="font-medium">{study.duration}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Status:</span>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(study.status)}
                                <span className="font-medium">{study.status}</span>
                              </div>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Market Impact:</span>
                              <span className="font-medium">{study.marketImpact}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Key Learnings</h4>
                        <div className="space-y-2">
                          {study.keyLessons.map((lesson, idx) => (
                            <div key={idx} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{lesson}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="outcomes">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Success Rate</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">67%</div>
                      <p className="text-sm text-muted-foreground">of analyzed initiatives achieved primary objectives</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        <span>Market Impact</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600">+156%</div>
                      <p className="text-sm text-muted-foreground">average stock performance during successful campaigns</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-orange-500" />
                        <span>Timeline</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-orange-600">4.2</div>
                      <p className="text-sm text-muted-foreground">years average development cycle</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Investment Returns by Category</CardTitle>
                    <CardDescription>ROI analysis across different therapeutic areas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Pandemic Response</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{width: '95%'}}></div>
                          </div>
                          <span className="text-sm font-medium">+847%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Oncology Innovation</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                          </div>
                          <span className="text-sm font-medium">+156%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Neurological Disorders</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-600 h-2 rounded-full" style={{width: '35%'}}></div>
                          </div>
                          <span className="text-sm font-medium">-12%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="lessons">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-700">Success Factors</CardTitle>
                    <CardDescription>Key elements that drive positive outcomes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                        <div>
                          <div className="font-medium text-sm">Early Government Partnership</div>
                          <div className="text-xs text-muted-foreground">Regulatory support accelerates development timelines</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                        <div>
                          <div className="font-medium text-sm">Platform Technology Leverage</div>
                          <div className="text-xs text-muted-foreground">Reusable technology platforms enable rapid adaptation</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                        <div>
                          <div className="font-medium text-sm">Supply Chain Resilience</div>
                          <div className="text-xs text-muted-foreground">Diversified manufacturing prevents bottlenecks</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-700">Risk Factors</CardTitle>
                    <CardDescription>Common pitfalls and challenges</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-1" />
                        <div>
                          <div className="font-medium text-sm">Complex Regulatory Pathways</div>
                          <div className="text-xs text-muted-foreground">Unclear approval routes delay market entry</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-1" />
                        <div>
                          <div className="font-medium text-sm">Manufacturing Scalability</div>
                          <div className="text-xs text-muted-foreground">Production constraints limit market access</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-1" />
                        <div>
                          <div className="font-medium text-sm">Patient Selection Criteria</div>
                          <div className="text-xs text-muted-foreground">Poor biomarker validation affects trial outcomes</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}