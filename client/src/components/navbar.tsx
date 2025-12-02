import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center" data-testid="link-home">
              <GraduationCap className="text-2xl text-primary mr-3" />
              <span className="text-xl font-bold text-foreground">Smart Study Zone</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link href="/home" className={`transition-colors ${location === '/home' || location === '/' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`} data-testid="link-home-nav">
                  Home
                </Link>
                <Link href="/parent-support" className={`transition-colors ${location === '/parent-support' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'}`} data-testid="link-parent-support">
                  Parent Support
                </Link>
                <Link href="/assessments" className={`transition-colors ${location === '/assessments' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`} data-testid="link-assessments">
                  Assessments
                </Link>
                <Link href="/yoga" className={`transition-colors ${location === '/yoga' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`} data-testid="link-yoga">
                  Yoga
                </Link>
                <Link href="/robotics" className={`transition-colors ${location === '/robotics' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`} data-testid="link-robotics">
                  Robotics
                </Link>
                <Link href="/games" className={`transition-colors ${location === '/games' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`} data-testid="link-games">
                  Games
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground" data-testid="text-user-name">
                    {user?.firstName || 'Parent'}
                  </span>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = "/api/logout"}
                    data-testid="button-logout"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <a href="#services" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-services">Services</a>
                <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-how-it-works">How It Works</a>
                <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-pricing">Pricing</a>
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-parent-login"
                >
                  Parent Login
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleMobileMenu}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border" data-testid="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {isAuthenticated ? (
                <>
                  <Link href="/home" className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary" data-testid="mobile-link-home">
                    Home
                  </Link>
                  <Link href="/parent-support" className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary" data-testid="mobile-link-parent-support">
                    Parent Support
                  </Link>
                  <Link href="/assessments" className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary" data-testid="mobile-link-assessments">
                    Assessments
                  </Link>
                  <Link href="/yoga" className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary" data-testid="mobile-link-yoga">
                    Yoga
                  </Link>
                  <Link href="/robotics" className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary" data-testid="mobile-link-robotics">
                    Robotics
                  </Link>
                  <Link href="/games" className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary" data-testid="mobile-link-games">
                    Games
                  </Link>
                  <div className="px-3 py-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = "/api/logout"}
                      data-testid="mobile-button-logout"
                    >
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <a href="#services" className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary" data-testid="mobile-link-services">Services</a>
                  <a href="#how-it-works" className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary" data-testid="mobile-link-how-it-works">How It Works</a>
                  <a href="#pricing" className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary" data-testid="mobile-link-pricing">Pricing</a>
                  <div className="px-3 py-2">
                    <Button 
                      onClick={() => window.location.href = "/api/login"}
                      data-testid="mobile-button-parent-login"
                    >
                      Parent Login
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
