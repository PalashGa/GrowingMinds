import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import logoImage from "@assets/logo-png_1764759697879.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-6">
              <img src={logoImage} alt="Growing Mind" className="h-12 w-12 mr-3 rounded-full" />
              <div>
                <span className="text-xl font-bold">Growing Mind</span>
                <p className="text-sm text-white/70">Children's Future</p>
              </div>
            </div>
            <p className="text-white/70 mb-6" data-testid="text-footer-description">
              Empowering children's development through comprehensive assessments, personalized programs, and expert guidance.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-white/70 hover:text-primary transition-colors"
                data-testid="link-facebook"
              >
                <Facebook className="text-xl" />
              </a>
              <a 
                href="#" 
                className="text-white/70 hover:text-primary transition-colors"
                data-testid="link-twitter"
              >
                <Twitter className="text-xl" />
              </a>
              <a 
                href="#" 
                className="text-white/70 hover:text-primary transition-colors"
                data-testid="link-instagram"
              >
                <Instagram className="text-xl" />
              </a>
              <a 
                href="#" 
                className="text-white/70 hover:text-primary transition-colors"
                data-testid="link-linkedin"
              >
                <Linkedin className="text-xl" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6" data-testid="text-programs-header">Programs</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors" data-testid="link-behavioral-assessments">Behavioral Assessments</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors" data-testid="link-kids-yoga">Kids Yoga</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors" data-testid="link-nutrition-plans">Nutrition Plans</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors" data-testid="link-robotics-learning">Robotics Learning</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors" data-testid="link-educational-games">Educational Games</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6" data-testid="text-support-header">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors" data-testid="link-help-center">Help Center</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors" data-testid="link-parent-resources">Parent Resources</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors" data-testid="link-expert-consultations">Expert Consultations</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors" data-testid="link-community-forum">Community Forum</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors" data-testid="link-contact-us">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6" data-testid="text-company-header">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors" data-testid="link-about-us">About Us</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors" data-testid="link-our-experts">Our Experts</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors" data-testid="link-privacy-policy">Privacy Policy</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors" data-testid="link-terms-of-service">Terms of Service</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors" data-testid="link-careers">Careers</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-12 pt-8 text-center">
          <p className="text-white/70" data-testid="text-copyright">
            © {currentYear} Growing Mind. All rights reserved. | Children's Future - Designed for bright minds.
          </p>
        </div>
      </div>
    </footer>
  );
}
