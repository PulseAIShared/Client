import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface TimeSlot {
  time: string;
  available: boolean;
}

export const MockCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Generate some mock dates for the next few weeks
  const generateCalendarDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 21; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Skip weekends for demo booking
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date);
      }
    }
    return dates;
  };

  // Generate mock time slots
  const generateTimeSlots = (): TimeSlot[] => {
    const slots = [
      '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'
    ];
    
    return slots.map(time => ({
      time,
      available: Math.random() > 0.3 // Random availability for visual effect
    }));
  };

  const calendarDates = generateCalendarDates();
  const timeSlots = generateTimeSlots();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBookDemo = () => {
    // This would normally submit to Calendly or similar service
    alert('Demo booking functionality will be available soon! We\'ll contact you to schedule your personalized demo.');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Date Selection */}
        <div className="bg-surface-primary rounded-xl p-6 border border-border-primary">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Select a Date</h3>
          <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
            {calendarDates.map((date, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleDateSelect(date)}
                className={`p-3 rounded-lg text-left transition-all duration-200 ${
                  selectedDate?.toDateString() === date.toDateString()
                    ? 'bg-blue-600 text-white'
                    : 'bg-bg-secondary hover:bg-blue-50 dark:hover:bg-slate-700 text-text-primary'
                }`}
              >
                {formatDate(date)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div className="bg-surface-primary rounded-xl p-6 border border-border-primary">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {selectedDate ? `Available Times - ${formatDate(selectedDate)}` : 'Select a Date First'}
          </h3>
          
          {selectedDate ? (
            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
              {timeSlots.map((slot, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => slot.available && handleTimeSelect(slot.time)}
                  disabled={!slot.available}
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    !slot.available
                      ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
                      : selectedTime === slot.time
                      ? 'bg-blue-600 text-white'
                      : 'bg-bg-secondary hover:bg-blue-50 dark:hover:bg-slate-700 text-text-primary hover:border-blue-300'
                  }`}
                >
                  {slot.time}
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-text-muted">Please select a date to view available times</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Confirmation */}
      {selectedDate && selectedTime && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white"
        >
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Confirm Your Demo</h3>
            <p className="mb-4">
              <span className="font-medium">{formatDate(selectedDate)}</span> at <span className="font-medium">{selectedTime}</span>
            </p>
            <p className="text-blue-100 mb-6 text-sm">
              Duration: 30 minutes • We'll send you a calendar invite with the meeting link
            </p>
            <button
              onClick={handleBookDemo}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Confirm Demo Booking
            </button>
          </div>
        </motion.div>
      )}

      {/* Demo Information */}
      <div className="mt-8 bg-surface-primary rounded-xl p-6 border border-border-primary">
        <h3 className="text-lg font-semibold text-text-primary mb-4">What to Expect in Your Demo</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 002 2h2a2 2 0 012-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="font-semibold text-text-primary mb-2">Platform Walkthrough</h4>
            <p className="text-text-muted text-sm">See PulseLTV in action with your data scenarios</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-text-primary mb-2">Q&A Session</h4>
            <p className="text-text-muted text-sm">Get answers to your specific churn reduction questions</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-text-primary mb-2">Custom Strategy</h4>
            <p className="text-text-muted text-sm">Discuss implementation plan for your business</p>
          </div>
        </div>
      </div>
    </div>
  );
};