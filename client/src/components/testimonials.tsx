import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      rating: 5,
      text: "The behavioral assessment helped us understand Emma's learning style. The personalized nutrition plan has improved her focus dramatically!",
      author: "Sarah Johnson",
      role: "Mother of Emma, age 10",
      avatar: "https://pixabay.com/get/g0230b5af45b526dd79894ba2dc9ae3fe8c697b02eda2a9c4267ece464a49dfe8361e21faf29eeeb26e8d59b62335973f81d9b9d9a50f5ea980679c9fa400e46e_1280.jpg"
    },
    {
      id: 2,
      rating: 5,
      text: "My son loves the robotics program! It's amazing to see him building confidence while learning technology. The progress reports are so detailed.",
      author: "Michael Chen",
      role: "Father of Alex, age 12",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=64&h=64"
    },
    {
      id: 3,
      rating: 5,
      text: "The yoga sessions have been a game-changer for my daughter's anxiety. She's calmer, more focused, and her grades have improved significantly.",
      author: "Linda Rodriguez",
      role: "Mother of Sophia, age 14",
      avatar: "https://pixabay.com/get/gd436a760734d6280bbbc0956cf81c81a2e35a7104ea015888387d994941f1303ce13e296596004684131941a6f8670b1351ab2a9b928e56f5ec3fde67c2506d0_1280.jpg"
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            What Parents Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real stories from families who've seen amazing transformations in their children's development.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-card p-8 rounded-2xl shadow-lg border border-border"
              data-testid={`card-testimonial-${testimonial.id}`}
            >
              <div className="flex items-center mb-6">
                <div className="flex text-accent text-xl" data-testid={`rating-stars-${testimonial.id}`}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground mb-6 italic" data-testid={`text-testimonial-${testimonial.id}`}>
                "{testimonial.text}"
              </p>
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={`${testimonial.author} testimonial`} 
                  className="w-12 h-12 rounded-full object-cover mr-4"
                  data-testid={`img-avatar-${testimonial.id}`}
                />
                <div>
                  <div className="font-semibold text-foreground" data-testid={`text-author-${testimonial.id}`}>
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-muted-foreground" data-testid={`text-role-${testimonial.id}`}>
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
