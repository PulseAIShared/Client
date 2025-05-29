import React from 'react';
import { motion } from 'framer-motion';

export const TestimonialsSection = () => {
  const testimonials = [
    {
      content: "BodyLedger has completely transformed my workout routine. I'm now able to track my progress and see real improvements week over week.",
      name: "Emma Reynolds",
      role: "Fitness Enthusiast",
      imageUrl: "/path/to/testimonial-image-1.jpg"
    },
    {
      content: "As a personal trainer, I recommend BodyLedger to all my clients. The template system makes it so easy to create and share custom workout plans.",
      name: "Marcus Johnson",
      role: "Personal Trainer",
      imageUrl: "/path/to/testimonial-image-2.jpg"
    },
    {
      content: "I've tried many fitness apps, but BodyLedger stands out for its comprehensive tracking features and user-friendly interface.",
      name: "Sophia Chen",
      role: "Marathon Runner",
      imageUrl: "/path/to/testimonial-image-3.jpg"
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            What our users are saying
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              className="bg-white p-8 rounded-xl shadow-md"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-xl font-medium text-gray-900 mb-1">"</div>
              <p className="text-gray-600 mb-6">
                {testimonial.content}
              </p>
              <div className="text-right text-xl font-medium text-gray-900 mb-4">"</div>
              
              <div className="flex items-center">
                <img 
                  src={testimonial.imageUrl} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <div className="font-medium text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};