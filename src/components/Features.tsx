import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Brain, Calendar, Bell } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Secure Upload",
    description: "Upload and store your medical reports safely with encrypted storage"
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Get instant AI-powered insights and personalized diet recommendations"
  },
  {
    icon: Calendar,
    title: "Easy Scheduling",
    description: "Book appointments with doctors at your convenience"
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Never miss your medication with timely notifications"
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete health management platform designed to make your healthcare journey seamless
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="shadow-soft hover:shadow-glow transition-shadow duration-300"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
