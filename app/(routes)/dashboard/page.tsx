import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, BookOpen, DoorOpen, Calendar, Check, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2/3 width on desktop) */}
        <div className="md:col-span-2 space-y-6">
          {/* Credits Dashboard Card */}
          <Card className="p-6">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Credits Dashboard</h2>
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Credit Usage</span>
                    <span className="text-green-500">35%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-black rounded-full" style={{ width: "35%" }}></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-sm text-muted-foreground">Total Credits</span>
                        <div className="ml-1 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                          <Info className="h-3 w-3 text-blue-600" />
                        </div>
                      </div>
                      <span className="text-2xl font-bold">1,000</span>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-sm text-muted-foreground">Used Credits</span>
                        <div className="ml-1 h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center">
                          <Info className="h-3 w-3 text-amber-600" />
                        </div>
                      </div>
                      <span className="text-2xl font-bold">350</span>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-green-50">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-sm text-muted-foreground">Remaining Credits</span>
                        <div className="ml-1 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                      </div>
                      <span className="text-2xl font-bold">650</span>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Center */}
          <Card className="p-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Action Center</h2>
              
              <div className="flex justify-center gap-4 mb-6">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-md relative">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span className="text-lg">View Timetable</span>
                  <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                    3
                  </div>
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-md">
                  <span className="text-lg">Buy Credits</span>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" className="p-4 h-auto flex items-center justify-center gap-2">
                  <span className="h-5 w-5 rounded-full border flex items-center justify-center">
                    <span className="h-3 w-3 text-primary">+</span>
                  </span>
                  <span>Create New Session</span>
                </Button>
                
                <Button variant="outline" className="p-4 h-auto flex items-center justify-center gap-2">
                  <span className="h-5 w-5 text-primary">✏️</span>
                  <span>Edit Timetable</span>
                </Button>
                
                <Button variant="outline" className="p-4 h-auto flex items-center justify-center gap-2">
                  <span className="h-5 w-5 text-primary">↓</span>
                  <span>Export Schedule</span>
                </Button>
                
                <Button variant="outline" className="p-4 h-auto flex items-center justify-center gap-2">
                  <span className="h-5 w-5 text-primary">↗️</span>
                  <span>Share Timetable</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (1/3 width on desktop) - User Profile */}
        <div className="md:row-span-1">
          <Card className="p-6 h-full">
            <div className="flex flex-col space-y-6 h-full">
              <h2 className="text-2xl font-bold">User Profile</h2>
              
              <div className="flex items-center gap-4">
                <div className="h-40 w-40 rounded-full bg-yellow-200 overflow-hidden flex items-center justify-center">
                  <img 
                    src="/man.png" 
                    alt="User" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Shashwat Upadhay</h3>
                  <p className="text-muted-foreground">Department Administrator</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Organization</span>
                  <span className="font-medium">Skylark University</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last login</span>
                  <span className="font-medium">{new Date().toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold mt-2">Recent Activity</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <div className="flex-grow">
                      <p className="text-sm">Created new timetable for Computer Science</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <div className="flex-grow">
                      <p className="text-sm">Updated faculty schedule</p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                    <div className="flex-grow">
                      <p className="text-sm">Purchased 500 additional credits</p>
                      <p className="text-xs text-muted-foreground">Yesterday</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Organization Stats (Full Width) */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Your Organization Stats</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Departments
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Faculty
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Active Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Classrooms
              </CardTitle>
              <DoorOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
            </CardContent>
          </Card>
        </div>
      </Card>
    </div>
  );
}