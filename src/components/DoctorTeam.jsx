import React from 'react';
import { Star } from 'lucide-react';

const DoctorTeam = () => {
  // Structured doctor data parsed from raw text
  const doctors = [
    {
      id: 1,
      name: "Dr. Rajesh Sharma",
      specialty: "Cardiologist",
      rating: "4.0",
      experience: "9",
      status: "Active"
    },
    {
      id: 2,
      name: "Dr. Priya Mehta",
      specialty: "Cardiologist",
      rating: "4.6",
      experience: "15",
      status: "Active"
    },
    {
      id: 3,
      name: "Dr. Sunil Deshmukh",
      specialty: "Cardiologist",
      rating: "4.8",
      experience: "7",
      status: "Active"
    },
    {
      id: 4,
      name: "Dr. Anil Patil",
      specialty: "Neurologist",
      rating: "4.8",
      experience: "17",
      status: "Active"
    },
    {
      id: 5,
      name: "Dr. Asha Joshi",
      specialty: "Neurologist",
      rating: "4.9",
      experience: "17",
      status: "Active"
    },
    {
      id: 6,
      name: "Dr. Vikram Singh",
      specialty: "Neurologist",
      rating: "4.7",
      experience: "11",
      status: "Active"
    },
    {
      id: 7,
      name: "Dr. Mahesh Jadhav",
      specialty: "Orthopedic Surgeon",
      rating: "4.4",
      experience: "10",
      status: "Active"
    },
    {
      id: 8,
      name: "Dr. Nilesh More",
      specialty: "Orthopedic Surgeon",
      rating: "4.9",
      experience: "12",
      status: "Active"
    },
    {
      id: 9,
      name: "Dr. Sujata Gite",
      specialty: "Orthopedic Surgeon",
      rating: "4.3",
      experience: "3",
      status: "Active"
    },
    {
      id: 10,
      name: "Dr. Balasaheb Pawar",
      specialty: "General Physician",
      rating: "4.5",
      experience: "7",
      status: "Active"
    },
    {
      id: 11,
      name: "Dr. Shubhangi Kulkarni",
      specialty: "General Physician",
      rating: "4.5",
      experience: "9",
      status: "Active"
    },
    {
      id: 12,
      name: "Dr. Ramesh Khalkar",
      specialty: "General Physician",
      rating: "4.6",
      experience: "15",
      status: "Active"
    },
    {
      id: 13,
      name: "Dr. Shilpa Deshpande",
      specialty: "Pediatrician",
      rating: "4.6",
      experience: "16",
      status: "Active"
    },
    {
      id: 14,
      name: "Dr. Ajit Ghorpade",
      specialty: "Pediatrician",
      rating: "4.6",
      experience: "4",
      status: "Active"
    },
    {
      id: 15,
      name: "Dr. Neha Choudhary",
      specialty: "Pediatrician",
      rating: "4.7",
      experience: "9",
      status: "Active"
    },
    {
      id: 16,
      name: "Dr. Kirti Shinde",
      specialty: "Gynecologist",
      rating: "4.3",
      experience: "21",
      status: "Active"
    },
    {
      id: 17,
      name: "Dr. Mrunalini Dambal",
      specialty: "Gynecologist",
      rating: "4.4",
      experience: "7",
      status: "Active"
    },
    {
      id: 18,
      name: "Dr. Pooja Malhotra",
      specialty: "Gynecologist",
      rating: "4.6",
      experience: "16",
      status: "Active"
    },
    {
      id: 19,
      name: "Dr. Pravin Sangle",
      specialty: "Dermatologist",
      rating: "4.9",
      experience: "4",
      status: "Active"
    },
    {
      id: 20,
      name: "Dr. Ayesha Shaikh",
      specialty: "Dermatologist",
      rating: "4.6",
      experience: "6",
      status: "Active"
    },
    {
      id: 21,
      name: "Dr. Shirish Kangutkar",
      specialty: "Ophthalmologist",
      rating: "4.1",
      experience: "2",
      status: "Active"
    },
    {
      id: 22,
      name: "Dr. Swapnil Adsul",
      specialty: "Ophthalmologist",
      rating: "4.4",
      experience: "12",
      status: "Active"
    },
    {
      id: 23,
      name: "Dr. Girish Kulkarni",
      specialty: "ENT Specialist",
      rating: "4.5",
      experience: "4",
      status: "Active"
    },
    {
      id: 24,
      name: "Dr. Abhijit Patil",
      specialty: "ENT Specialist",
      rating: "4.2",
      experience: "2",
      status: "Active"
    },
    {
      id: 25,
      name: "Dr. Sanjay Borse",
      specialty: "Gastroenterologist",
      rating: "4.2",
      experience: "13",
      status: "Active"
    },
    {
      id: 26,
      name: "Dr. Tejaswi Nalawade",
      specialty: "Gastroenterologist",
      rating: "4.9",
      experience: "6",
      status: "Active"
    },
    {
      id: 27,
      name: "Dr. Kavita Joshi",
      specialty: "Pathologist",
      rating: "4.5",
      experience: "4",
      status: "Active"
    },
    {
      id: 28,
      name: "Dr. Anand Deshmukh",
      specialty: "Pathologist",
      rating: "4.8",
      experience: "5",
      status: "Active"
    }
  ];

  // Helper function to get initials from name
  const getInitials = (name) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          {/* Pill Badge */}
          <div className="inline-block mb-4">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-teal-100 text-teal-700">
              Our Medical Team
            </span>
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4 tracking-tight">
            Meet Our Expert Doctors
          </h2>

          {/* Subtitle */}
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Our team of highly qualified specialists is dedicated to providing you with personalized, compassionate care.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-2xl shadow-md p-6 border border-slate-100 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Avatar */}
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                  <span className="text-teal-700 font-bold text-2xl">
                    {getInitials(doctor.name)}
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-xl font-bold text-slate-800 mb-1">
                  {doctor.name}
                </h3>

                {/* Specialty */}
                <p className="text-teal-600 font-medium mb-3">
                  {doctor.specialty}
                </p>

                {/* Rating & Experience */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold text-slate-700">
                      {doctor.rating}
                    </span>
                  </div>
                  <span className="text-slate-300">·</span>
                  <span className="text-sm text-slate-500">
                    {doctor.experience} yrs exp.
                  </span>
                </div>

                {/* Status Badge */}
                {doctor.status === "Active" && (
                  <div className="mb-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                      Available
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                className="w-full border border-teal-500 text-teal-600 rounded-xl py-2 px-4 font-semibold hover:bg-teal-50 transition-colors duration-300"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DoctorTeam;
