// Wallet Screen with API Integration
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shimmer/shimmer.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../providers/wallet_provider.dart';

class WalletScreen extends ConsumerStatefulWidget {
  const WalletScreen({super.key});

  @override
  ConsumerState<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends ConsumerState<WalletScreen> {
  @override
  void initState() {
    super.initState();
    // Fetch wallet data on screen load
    Future.microtask(() {
      ref.read(walletProvider.notifier).fetchWallet();
      ref.read(walletProvider.notifier).fetchTransactions();
    });
  }

  String _formatCurrency(int amount) {
    return amount.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  @override
  Widget build(BuildContext context) {
    final walletState = ref.watch(walletProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('ওয়ালেট', style: AppTypography.h4),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: walletState.isLoading && walletState.balance == 0
          ? _buildLoadingState()
          : RefreshIndicator(
              onRefresh: () async {
                await ref.read(walletProvider.notifier).fetchWallet();
                await ref.read(walletProvider.notifier).fetchTransactions();
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Balance Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [AppColors.primary, AppColors.primaryDark],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'মোট ব্যালেন্স',
                            style: AppTypography.labelMedium.copyWith(
                              color: Colors.white.withValues(alpha: 0.8),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '৳${_formatCurrency(walletState.balance)}',
                            style: AppTypography.h1.copyWith(
                              color: Colors.white,
                              fontSize: 40,
                            ),
                          ),
                          const SizedBox(height: 20),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: () => _showTopUpDialog(),
                                  icon: const Icon(
                                    Icons.add,
                                    color: AppColors.primary,
                                  ),
                                  label: Text(
                                    'টপ আপ',
                                    style: AppTypography.button.copyWith(
                                      color: AppColors.primary,
                                    ),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.white,
                                    foregroundColor: AppColors.primary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Loyalty Points
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.starFilled.withValues(
                                alpha: 0.1,
                              ),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.stars,
                              color: AppColors.starFilled,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'লয়্যালটি পয়েন্ট',
                                  style: AppTypography.labelMedium,
                                ),
                                Text(
                                  '${walletState.loyaltyPoints} পয়েন্ট',
                                  style: AppTypography.h4.copyWith(
                                    color: AppColors.starFilled,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.secondary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              walletState.loyaltyTierBengali,
                              style: AppTypography.labelSmall.copyWith(
                                color: AppColors.secondary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Transaction History
                    Text('লেনদেনের ইতিহাস', style: AppTypography.h4),
                    const SizedBox(height: 12),

                    // Transactions List or Empty State
                    if (walletState.transactions.isEmpty)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(40),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Column(
                          children: [
                            Icon(
                              Icons.receipt_long_outlined,
                              size: 60,
                              color: AppColors.textTertiary.withValues(
                                alpha: 0.5,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'কোনো লেনদেন নেই',
                              style: AppTypography.bodyMedium.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'আপনার লেনদেন এখানে দেখা যাবে',
                              style: AppTypography.bodySmall,
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      )
                    else
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: walletState.transactions.length,
                          separatorBuilder: (_, __) =>
                              Divider(height: 1, color: AppColors.divider),
                          itemBuilder: (context, index) {
                            final transaction = walletState.transactions[index];
                            return _TransactionItem(transaction: transaction);
                          },
                        ),
                      ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildLoadingState() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Shimmer.fromColors(
            baseColor: AppColors.shimmerBase,
            highlightColor: AppColors.shimmerHighlight,
            child: Container(
              height: 180,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Shimmer.fromColors(
            baseColor: AppColors.shimmerBase,
            highlightColor: AppColors.shimmerHighlight,
            child: Container(
              height: 80,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showTopUpDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('টপ আপ', style: AppTypography.h3),
        content: Text(
          'টপ আপ ফিচার শীঘ্রই আসছে!',
          style: AppTypography.bodyMedium,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('ঠিক আছে'),
          ),
        ],
      ),
    );
  }
}

class _TransactionItem extends StatelessWidget {
  final Transaction transaction;

  const _TransactionItem({required this.transaction});

  @override
  Widget build(BuildContext context) {
    final isCredit = transaction.isCredit;

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: (isCredit ? AppColors.success : AppColors.error)
                  .withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              isCredit ? Icons.add : Icons.remove,
              color: isCredit ? AppColors.success : AppColors.error,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(transaction.description, style: AppTypography.labelMedium),
                const SizedBox(height: 4),
                Text(
                  DateFormat('dd MMM, yyyy').format(transaction.createdAt),
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Text(
            '${isCredit ? '+' : '-'}৳${transaction.amount}',
            style: AppTypography.labelLarge.copyWith(
              color: isCredit ? AppColors.success : AppColors.error,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
