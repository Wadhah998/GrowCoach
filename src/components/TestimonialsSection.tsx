import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
  id: number;
  content: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  image: string;
  type: 'candidate' | 'company';
}

const TestimonialsSection = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      content: "GrowCoach matched me with a job that perfectly aligned with my skills and career goals. The AI-driven matches were incredibly relevant, and I found my dream position within two weeks!",
      name: "Sarah Johnson",
      role: "UX Designer",
      company: "TechInnovate",
      rating: 5,
      image: "https://images.pexels.com/photos/773371/pexels-photo-773371.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      type: 'candidate'
    },
    {
      id: 2,
      content: "As a tech startup, finding developers with the right skill set was always challenging until we found GrowCoach. Their matching algorithm brought us candidates who were not only technically skilled but also a great culture fit.",
      name: "Michael Chen",
      role: "CTO",
      company: "DataFlow Systems",
      rating: 5,
      image: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      type: 'company'
    },
    {
      id: 3,
      content: "The skill assessments on GrowCoach helped me identify areas where I needed improvement. After working on those skills, I received much better job matches and landed a role that advanced my career significantly.",
      name: "David Rodriguez",
      role: "Full Stack Developer",
      company: "CodeSphere",
      rating: 4,
      image: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      type: 'candidate'
    },
    {
      id: 4,
      content: "Our hiring process has become 70% more efficient since using GrowCoach. The pre-screened candidates save us countless hours in the recruitment process, and the quality of matches is outstanding.",
      name: "Rebecca Taylor",
      role: "HR Director",
      company: "Global Finance Group",
      rating: 5,
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      type: 'company'
    }
  ];

  const [activeType, setActiveType] = useState<'all' | 'candidate' | 'company'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredTestimonials = activeType === 'all' 
    ? testimonials 
    : testimonials.filter(t => t.type === activeType);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + filteredTestimonials.length) % filteredTestimonials.length);
  };

  return (
    <section className="py-20 bg-gray-900/70">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 bg-purple-900/30 text-purple-400 rounded-full text-sm font-medium mb-4">
            Success Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-400">
            Real experiences from candidates and companies who found their perfect match on GrowCoach.
          </p>
          
          <div className="mt-8 inline-flex p-1 bg-gray-800 rounded-lg">
            <button
              className={`px-5 py-2 rounded-md transition-all ${
                activeType === 'all' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => {
                setActiveType('all');
                setCurrentIndex(0);
              }}
            >
              All Stories
            </button>
            <button
              className={`px-5 py-2 rounded-md transition-all ${
                activeType === 'candidate' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => {
                setActiveType('candidate');
                setCurrentIndex(0);
              }}
            >
              Candidates
            </button>
            <button
              className={`px-5 py-2 rounded-md transition-all ${
                activeType === 'company' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => {
                setActiveType('company');
                setCurrentIndex(0);
              }}
            >
              Companies
            </button>
          </div>
        </div>

        {filteredTestimonials.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="bg-gray-800 rounded-2xl p-8 md:p-10 shadow-xl border border-gray-700">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-purple-500/30 flex-shrink-0">
                    <img 
                      src={filteredTestimonials[currentIndex].image} 
                      alt={filteredTestimonials[currentIndex].name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${i < filteredTestimonials[currentIndex].rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} 
                        />
                      ))}
                    </div>
                    
                    <blockquote className="text-lg md:text-xl italic text-gray-300 mb-6">
                      "{filteredTestimonials[currentIndex].content}"
                    </blockquote>
                    
                    <div>
                      <p className="font-bold text-white text-lg">{filteredTestimonials[currentIndex].name}</p>
                      <p className="text-gray-400">
                        {filteredTestimonials[currentIndex].role}, {filteredTestimonials[currentIndex].company}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-5 left-0 right-0 flex justify-center gap-4">
                <button 
                  onClick={prevTestimonial}
                  className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-600 transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={nextTestimonial}
                  className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-600 transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="mt-12 flex justify-center">
              {filteredTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 mx-1 rounded-full ${index === currentIndex ? 'bg-purple-500' : 'bg-gray-600'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;