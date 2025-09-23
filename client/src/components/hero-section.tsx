import { Button } from "@/components/ui/button";
import { Rocket, Play, Star, Heart } from "lucide-react";

export default function HeroSection() {
  const handleStartAssessment = () => {
    window.location.href = "/api/login";
  };

  return (
    <section className="gradient-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Unlock Your Child's 
              <span className="text-accent"> Full Potential</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Comprehensive development programs for children aged 5-16. From behavioral assessments to robotics, yoga to nutrition - everything your child needs to thrive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                onClick={handleStartAssessment}
                className="bg-accent text-accent-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:bg-accent/90 transition-colors shadow-lg"
                data-testid="button-start-assessment"
              >
                <Rocket className="mr-2" />
                Start Free Assessment
              </Button>
              <Button
                variant="outline"
                className="bg-white/20 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/30"
                data-testid="button-watch-demo"
              >
                <Play className="mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
          
          <div className="relative">
            {/* Happy children learning together with tablets and books */}
            <img 
              src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Happy children learning together" 
              className="rounded-2xl shadow-2xl floating-element w-full h-auto"
              data-testid="img-hero"
            />
            
            {/* Floating stats cards */}
            <div 
              className="absolute -top-6 -left-6 bg-white p-4 rounded-xl shadow-lg floating-element" 
              style={{ animationDelay: '-1s' }}
              data-testid="card-stat-assessments"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-primary" data-testid="text-stat-number-1">10,000+</div>
                <div className="text-sm text-muted-foreground" data-testid="text-stat-label-1">Kids Assessed</div>
              </div>
            </div>
            
            <div 
              className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg floating-element" 
              style={{ animationDelay: '-2s' }}
              data-testid="card-stat-satisfaction"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary" data-testid="text-stat-number-2">98%</div>
                <div className="text-sm text-muted-foreground" data-testid="text-stat-label-2">Parent Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 text-white/20 text-6xl floating-element">
        <Star />
      </div>
      <div 
        className="absolute bottom-20 right-10 text-white/20 text-4xl floating-element" 
        style={{ animationDelay: '-1.5s' }}
      >
        <Heart />
      </div>
    </section>
  );
}
