import { Button } from "@/components/ui/button";
import { Brain, Flower, Apple, Bot, Users, Gamepad2, CheckCircle } from "lucide-react";

export default function ServicesOverview() {
  const services = [
    {
      id: 'behavioral',
      icon: Brain,
      title: 'Behavioral Assessments',
      description: 'Comprehensive testing for personality, IQ, strengths/weaknesses, and career orientation (ages 9-16).',
      features: [
        'Behavioral Pattern Analysis',
        'Personality Type Assessment',
        'IQ & Career Guidance'
      ],
      buttonText: 'Start Assessment',
      colorClass: 'primary'
    },
    {
      id: 'yoga',
      icon: Flower,
      title: 'Kids Yoga Programs',
      description: 'Specialized yoga sessions to improve behavior, manage stress, and enhance focus.',
      features: [
        'Stress Management Techniques',
        'Behavior Improvement',
        'Enhanced Focus & Concentration'
      ],
      buttonText: 'Explore Yoga',
      colorClass: 'secondary'
    },
    {
      id: 'nutrition',
      icon: Apple,
      title: 'Nutrition Planning',
      description: 'Weekly diet plans tailored for optimal growth and mental health development.',
      features: [
        'Age-Appropriate Meal Plans',
        'Brain Development Focus',
        'Growth Optimization'
      ],
      buttonText: 'Get Meal Plans',
      colorClass: 'accent'
    },
    {
      id: 'robotics',
      icon: Bot,
      title: 'Robotics Learning',
      description: 'Interactive robotics programs introducing technology basics for ages 8-16.',
      features: [
        'Hands-on Projects',
        'Technology Fundamentals',
        'Problem-Solving Skills'
      ],
      buttonText: 'Start Learning',
      colorClass: 'primary'
    },
    {
      id: 'support',
      icon: Users,
      title: 'Parent Support',
      description: 'Scientific, actionable advice based on your child\'s assessment results.',
      features: [
        'Personalized Guidance',
        'Progress Tracking',
        'Expert Consultations'
      ],
      buttonText: 'Get Support',
      colorClass: 'secondary'
    },
    {
      id: 'games',
      icon: Gamepad2,
      title: 'Educational Games',
      description: 'Fun, interactive games integrated with learning objectives and progress tracking.',
      features: [
        'Learning Through Play',
        'Skill Development',
        'Progress Rewards'
      ],
      buttonText: 'Play Games',
      colorClass: 'accent'
    }
  ];

  const handleServiceClick = (serviceId: string) => {
    if (serviceId === 'behavioral') {
      window.location.href = "/api/login";
    } else {
      // For other services, redirect to login as well for now
      window.location.href = "/api/login";
    }
  };

  return (
    <section id="services" className="py-16 lg:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Complete Development Programs
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our scientifically-backed programs cover every aspect of your child's growth - from cognitive development to physical wellness.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <div 
                key={service.id}
                className="service-card bg-card p-8 rounded-2xl shadow-lg border border-border"
                data-testid={`card-service-${service.id}`}
              >
                <div className={`w-16 h-16 bg-${service.colorClass}/10 rounded-2xl flex items-center justify-center mb-6`}>
                  <IconComponent className={`text-2xl text-${service.colorClass}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4" data-testid={`text-service-title-${service.id}`}>
                  {service.title}
                </h3>
                <p className="text-muted-foreground mb-6" data-testid={`text-service-description-${service.id}`}>
                  {service.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-muted-foreground" data-testid={`text-service-feature-${service.id}-${index}`}>
                      <CheckCircle className="text-secondary mr-2 h-4 w-4" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleServiceClick(service.id)}
                  className={`w-full bg-${service.colorClass} text-${service.colorClass}-foreground py-3 rounded-xl hover:bg-${service.colorClass}/90 transition-colors`}
                  data-testid={`button-service-${service.id}`}
                >
                  {service.buttonText}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
