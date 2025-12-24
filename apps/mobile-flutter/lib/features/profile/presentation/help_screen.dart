// Help Screen
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';

class HelpScreen extends ConsumerWidget {
  const HelpScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('সাহায্য', style: AppTypography.h4),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Contact Section
            Text('যোগাযোগ করুন', style: AppTypography.h4),
            const SizedBox(height: 12),
            _ContactCard(
              icon: Icons.phone,
              title: 'ফোন',
              subtitle: '+880 1700-000000',
              onTap: () => _launchUrl('tel:+8801700000000'),
            ),
            _ContactCard(
              icon: Icons.email,
              title: 'ইমেইল',
              subtitle: 'support@zinurooms.com',
              onTap: () => _launchUrl('mailto:support@zinurooms.com'),
            ),
            _ContactCard(
              icon: Icons.chat,
              title: 'লাইভ চ্যাট',
              subtitle: '২৪/৭ সাপোর্ট',
              onTap: () {},
            ),
            const SizedBox(height: 24),

            // FAQ Section
            Text('সচরাচর জিজ্ঞাসা', style: AppTypography.h4),
            const SizedBox(height: 12),
            _FaqItem(
              question: 'বুকিং কিভাবে করব?',
              answer:
                  'হোম পেজ থেকে হোটেল খুঁজুন, রুম নির্বাচন করুন, তারিখ দিন এবং পেমেন্ট সম্পন্ন করুন।',
            ),
            _FaqItem(
              question: 'বুকিং বাতিল করতে কত টাকা কাটা যাবে?',
              answer:
                  'চেক-ইনের ২৪ ঘণ্টা আগে বাতিল করলে কোনো চার্জ নেই। ২৪ ঘণ্টার কমে বাতিল করলে ১ রাতের ভাড়া কাটা যাবে।',
            ),
            _FaqItem(
              question: 'পেমেন্ট পদ্ধতি কি কি?',
              answer:
                  'বিকাশ, নগদ, ক্রেডিট/ডেবিট কার্ড এবং হোটেলে ক্যাশ পেমেন্ট করতে পারবেন।',
            ),
            _FaqItem(
              question: 'রেফারেল বোনাস কিভাবে পাব?',
              answer:
                  'আপনার রেফারেল কোড বন্ধুদের দিন। তারা সাইন আপ করে প্রথম বুকিং সম্পন্ন করলে আপনারা দুজনেই ৳১০০ বোনাস পাবেন।',
            ),
            _FaqItem(
              question: 'ওয়ালেট ব্যালেন্স দিয়ে কিভাবে পে করব?',
              answer:
                  'বুকিংয়ের সময় পেমেন্ট পেজে "ওয়ালেট ব্যালেন্স ব্যবহার করুন" অপশন সিলেক্ট করুন।',
            ),
            const SizedBox(height: 24),

            // App Info
            Center(
              child: Column(
                children: [
                  Text(
                    'Zinu Rooms',
                    style: AppTypography.h3.copyWith(color: AppColors.primary),
                  ),
                  const SizedBox(height: 4),
                  Text('ভার্সন ১.০.০', style: AppTypography.bodySmall),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      TextButton(
                        onPressed: () {},
                        child: const Text('প্রাইভেসি পলিসি'),
                      ),
                      const Text(' • '),
                      TextButton(
                        onPressed: () {},
                        child: const Text('টার্মস অফ সার্ভিস'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }
}

class _ContactCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ContactCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: AppColors.primary),
        ),
        title: Text(title, style: AppTypography.labelLarge),
        subtitle: Text(subtitle, style: AppTypography.bodySmall),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}

class _FaqItem extends StatefulWidget {
  final String question;
  final String answer;

  const _FaqItem({required this.question, required this.answer});

  @override
  State<_FaqItem> createState() => _FaqItemState();
}

class _FaqItemState extends State<_FaqItem> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ExpansionTile(
        title: Text(widget.question, style: AppTypography.labelLarge),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Text(
              widget.answer,
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textSecondary,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
