from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Service, FAQ, Testimonial, AssistanceRequest

class Command(BaseCommand):
    help = 'Seeds initial eCare data for services, FAQs, and testimonials'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding initial eCare database records...')

        # Create admin user if not exists
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@ecare.gov', 'admin123')
            self.stdout.write(self.style.SUCCESS('Created default admin: admin / admin123'))

        # Seed Services
        services_data = [
            {
                'title': 'Online Clearance Request',
                'slug': 'online-clearance-request',
                'category': 'clearance',
                'short_description': 'Request barangay clearances, certificates, and official documents without visiting the office. Fast 24-48 hours turnaround.',
                'description': 'Request barangay clearances, certificates, and official documents without visiting the office. Upload requirements online and receive approved documents within 24-48 hours with digital signature and tracking.',
                'features': [
                    '24-hour processing time',
                    'Digital signature & verification',
                    'Document tracking system',
                    'Email & SMS notifications'
                ],
                'requirements': [
                    'Valid Government ID (uploaded)',
                    'Proof of residency',
                    'Purpose statement / Certificate purpose'
                ],
                'stats': {
                    'value1': '24hrs',
                    'label1': 'Avg. Processing',
                    'value2': '₱50',
                    'label2': 'Service Fee',
                    'value3': '4.9/5',
                    'label3': 'User Rating'
                },
                'fee': '₱50',
                'processing_time': '24-48 hours',
                'rating': '4.9/5',
                'image_url': '/images/s1.jpg',
                'order': 1
            },
            {
                'title': 'Appointment Booking System',
                'slug': 'appointment-booking-system',
                'category': 'appointment',
                'short_description': 'Schedule appointments with barangay officials, social workers, or community services at your convenience.',
                'description': 'Schedule appointments with barangay officials, social workers, or community services at your convenience. Choose your preferred date and time slot online without queuing.',
                'features': [
                    'Real-time availability calendar',
                    'Automatic reminders via SMS/Email',
                    'Easy rescheduling and cancellation',
                    'Virtual and face-to-face meeting options'
                ],
                'requirements': [
                    'Legal consultations',
                    'Social services evaluation',
                    'Community assistance programs',
                    'Document verification'
                ],
                'stats': {
                    'value1': '15min',
                    'label1': 'Time Slots',
                    'value2': 'Free',
                    'label2': 'No Fee',
                    'value3': '500+',
                    'label3': 'Monthly Bookings'
                },
                'fee': 'Free',
                'processing_time': 'Instant confirmation',
                'rating': '4.8/5',
                'image_url': '/images/s2.jpg',
                'order': 2
            },
            {
                'title': 'Incident Reporting System',
                'slug': 'incident-reporting-system',
                'category': 'incident',
                'short_description': 'Report emergencies, safety concerns, or community issues instantly with 24/7 rapid response.',
                'description': 'Report emergencies, safety concerns, or community issues instantly. Our 24/7 system ensures rapid response, GPS location tracking, and proper documentation of all incidents.',
                'features': [
                    'Instant alert notifications to authorities',
                    'Photo and video upload support',
                    'GPS location tagging',
                    'Anonymous reporting option'
                ],
                'requirements': [
                    'Incident description and details',
                    'Location details / Landmark',
                    'Optional: Photos or videos of incident',
                    'Contact information (optional for anonymous)'
                ],
                'stats': {
                    'value1': 'Instant',
                    'label1': 'Response',
                    'value2': '24/7',
                    'label2': 'Available',
                    'value3': '98%',
                    'label3': 'Resolution Rate'
                },
                'fee': 'Free',
                'processing_time': 'Immediate (Under 15 mins)',
                'rating': '4.9/5',
                'image_url': '/images/s3.jpg',
                'order': 3
            },
            {
                'title': 'Community Events & Outreach',
                'slug': 'community-events-outreach',
                'category': 'community',
                'short_description': 'Stay updated with all barangay events, health missions, job fairs, and community youth programs.',
                'description': 'Stay updated with all barangay events, programs, and activities. Register for events, view schedules, and receive reminders for upcoming community gatherings.',
                'features': [
                    'Interactive event calendar',
                    'One-click registration for workshops and missions',
                    'Automated event reminders',
                    'Community announcements feed'
                ],
                'requirements': [
                    'Community resident status',
                    'Valid contact information',
                    'Event-specific guidelines (if applicable)'
                ],
                'stats': {
                    'value1': '20+',
                    'label1': 'Events/Month',
                    'value2': 'Free',
                    'label2': 'Registration',
                    'value3': '1000+',
                    'label3': 'Participants'
                },
                'fee': 'Free',
                'processing_time': 'Instant pass',
                'rating': '4.9/5',
                'image_url': '/images/s4.jpg',
                'order': 4
            },
            {
                'title': 'Volunteer Program',
                'slug': 'volunteer-program',
                'category': 'community',
                'short_description': 'Join our community volunteer program to support relief operations, teaching, and environmental cleanups.',
                'description': 'Join our community volunteer program and make a difference. Connect with various volunteer opportunities, track your hours, and earn recognition for your contributions.',
                'features': [
                    'Flexible project scheduling',
                    'Hour tracking and verified logging',
                    'Official certificate of community service',
                    'Skills development and training sessions'
                ],
                'requirements': [
                    'Age 16 and above',
                    'Valid ID / School ID',
                    'Commitment to service',
                    'Background check (for sensitive projects)'
                ],
                'stats': {
                    'value1': '200+',
                    'label1': 'Active Volunteers',
                    'value2': 'Free',
                    'label2': 'Join Now',
                    'value3': '50+',
                    'label3': 'Programs'
                },
                'fee': 'Free',
                'processing_time': '1-2 days',
                'rating': '5.0/5',
                'image_url': '/images/s5.jpg',
                'order': 5
            },
            {
                'title': 'Health Services & Medical Aid',
                'slug': 'health-services-medical-aid',
                'category': 'health',
                'short_description': 'Access health checkups, prescription assistance, immunization schedules, and medical aid programs.',
                'description': 'Access health services including consultations, medical records, vaccination schedules, and health programs. Book appointments with healthcare professionals and manage health records digitally.',
                'features': [
                    'Online doctor consultations and triage',
                    'Digital medical record history',
                    'Prescription and medicine request',
                    'Government subsidy assistance'
                ],
                'requirements': [
                    'Valid ID / Barangay Health Card',
                    'PhilHealth number (if applicable)',
                    'Medical history summary',
                    'Emergency contact information'
                ],
                'stats': {
                    'value1': '30min',
                    'label1': 'Consultation',
                    'value2': '₱100 / Free Subsidy',
                    'label2': 'Fee',
                    'value3': '4.8/5',
                    'label3': 'Rating'
                },
                'fee': 'Free to ₱100',
                'processing_time': 'Same-day triage',
                'rating': '4.8/5',
                'image_url': '/images/s6.jpg',
                'order': 6
            }
        ]

        for s in services_data:
            Service.objects.update_or_create(
                slug=s['slug'],
                defaults=s
            )
        self.stdout.write(self.style.SUCCESS(f'Seeded {len(services_data)} Services.'))

        # Seed Testimonials
        testimonials_data = [
            {
                'name': 'Maria Santos',
                'role': 'Barangay Resident',
                'rating': 5,
                'comment': 'eCare made getting my barangay clearance so convenient. I applied during my lunch break and picked it up the very next morning without standing in any lines!',
                'avatar': '/images/t1.jpg'
            },
            {
                'name': 'Roberto Gonzales',
                'role': 'Senior Citizen & Resident',
                'rating': 5,
                'comment': 'The emergency assistance form helped our family receive immediate medical subsidy support when my wife was hospitalized. Truly life-saving service.',
                'avatar': '/images/t2.jpg'
            },
            {
                'name': 'Alyssa Ramos',
                'role': 'Youth Volunteer Leader',
                'rating': 5,
                'comment': 'Volunteering with eCare has connected me with our community in ways I never thought possible. The platform makes tracking our outreach programs effortless.',
                'avatar': '/images/t3.jpg'
            }
        ]

        for t in testimonials_data:
            Testimonial.objects.update_or_create(
                name=t['name'],
                defaults=t
            )
        self.stdout.write(self.style.SUCCESS('Seeded Testimonials.'))

        # Seed FAQs
        faqs_data = [
            {
                'question': 'How quickly are assistance requests processed?',
                'answer': 'Emergency requests are prioritized and reviewed within 15 to 60 minutes. Standard financial and social assistance applications are reviewed within 24 to 48 hours.',
                'category': 'Assistance',
                'order': 1
            },
            {
                'question': 'What documents do I need to prepare before applying?',
                'answer': 'Generally you will need a valid government-issued ID or barangay ID, proof of address, and documents supporting your specific request (e.g. medical prescription, hospital bill, school assessment, or incident photo).',
                'category': 'Assistance',
                'order': 2
            },
            {
                'question': 'How do I track the status of my assistance request?',
                'answer': 'Every submission generates a unique tracking Reference Number (e.g., CC-2026-XXXX). You can enter this reference number on our Track Status page or view your personal dashboard anytime.',
                'category': 'General',
                'order': 3
            },
            {
                'question': 'Are the services and clearances available online legally valid?',
                'answer': 'Yes. All clearances, permits, and documents issued through eCare carry digital verification QR codes and official electronic signatures recognized by government and private entities.',
                'category': 'Clearance',
                'order': 4
            },
            {
                'question': 'Is my personal information kept secure and confidential?',
                'answer': 'Strict data privacy standards under the Data Privacy Act are maintained. Your information is encrypted and only accessible to authorized barangay social workers and verification officers.',
                'category': 'Privacy',
                'order': 5
            }
        ]

        for f in faqs_data:
            FAQ.objects.update_or_create(
                question=f['question'],
                defaults=f
            )
        self.stdout.write(self.style.SUCCESS('Seeded FAQs.'))
        self.stdout.write(self.style.SUCCESS('Database seeding finished successfully!'))
