import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_bn.dart';
import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'generated/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('bn'),
    Locale('en'),
  ];

  /// App title
  ///
  /// In en, this message translates to:
  /// **'Zinu Rooms'**
  String get appTitle;

  /// No description provided for @home.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get home;

  /// No description provided for @search.
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get search;

  /// No description provided for @bookings.
  ///
  /// In en, this message translates to:
  /// **'Bookings'**
  String get bookings;

  /// No description provided for @profile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// No description provided for @greeting.
  ///
  /// In en, this message translates to:
  /// **'Hello'**
  String get greeting;

  /// No description provided for @findPerfectStay.
  ///
  /// In en, this message translates to:
  /// **'Find your perfect stay'**
  String get findPerfectStay;

  /// No description provided for @searchHint.
  ///
  /// In en, this message translates to:
  /// **'Search hotels or cities...'**
  String get searchHint;

  /// No description provided for @popularDestinations.
  ///
  /// In en, this message translates to:
  /// **'Popular Destinations'**
  String get popularDestinations;

  /// No description provided for @featuredHotels.
  ///
  /// In en, this message translates to:
  /// **'Featured Hotels'**
  String get featuredHotels;

  /// No description provided for @viewAll.
  ///
  /// In en, this message translates to:
  /// **'View All'**
  String get viewAll;

  /// No description provided for @checkIn.
  ///
  /// In en, this message translates to:
  /// **'Check-in'**
  String get checkIn;

  /// No description provided for @checkOut.
  ///
  /// In en, this message translates to:
  /// **'Check-out'**
  String get checkOut;

  /// No description provided for @guests.
  ///
  /// In en, this message translates to:
  /// **'Guests'**
  String get guests;

  /// No description provided for @rooms.
  ///
  /// In en, this message translates to:
  /// **'Rooms'**
  String get rooms;

  /// No description provided for @bookNow.
  ///
  /// In en, this message translates to:
  /// **'Book Now'**
  String get bookNow;

  /// No description provided for @perNight.
  ///
  /// In en, this message translates to:
  /// **'per night'**
  String get perNight;

  /// No description provided for @reviews.
  ///
  /// In en, this message translates to:
  /// **'reviews'**
  String get reviews;

  /// No description provided for @myBookings.
  ///
  /// In en, this message translates to:
  /// **'My Bookings'**
  String get myBookings;

  /// No description provided for @upcoming.
  ///
  /// In en, this message translates to:
  /// **'Upcoming'**
  String get upcoming;

  /// No description provided for @completed.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get completed;

  /// No description provided for @cancelled.
  ///
  /// In en, this message translates to:
  /// **'Cancelled'**
  String get cancelled;

  /// No description provided for @noBookings.
  ///
  /// In en, this message translates to:
  /// **'No bookings yet'**
  String get noBookings;

  /// No description provided for @bookingConfirmed.
  ///
  /// In en, this message translates to:
  /// **'Booking Confirmed!'**
  String get bookingConfirmed;

  /// No description provided for @notifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notifications;

  /// No description provided for @noNotifications.
  ///
  /// In en, this message translates to:
  /// **'No notifications'**
  String get noNotifications;

  /// No description provided for @editProfile.
  ///
  /// In en, this message translates to:
  /// **'Edit Profile'**
  String get editProfile;

  /// No description provided for @name.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get name;

  /// No description provided for @email.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get email;

  /// No description provided for @phone.
  ///
  /// In en, this message translates to:
  /// **'Phone'**
  String get phone;

  /// No description provided for @save.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// No description provided for @settings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// No description provided for @darkMode.
  ///
  /// In en, this message translates to:
  /// **'Dark Mode'**
  String get darkMode;

  /// No description provided for @language.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// No description provided for @english.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get english;

  /// No description provided for @bengali.
  ///
  /// In en, this message translates to:
  /// **'Bengali'**
  String get bengali;

  /// No description provided for @login.
  ///
  /// In en, this message translates to:
  /// **'Login'**
  String get login;

  /// No description provided for @logout.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get logout;

  /// No description provided for @register.
  ///
  /// In en, this message translates to:
  /// **'Register'**
  String get register;

  /// No description provided for @retry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retry;

  /// No description provided for @loadError.
  ///
  /// In en, this message translates to:
  /// **'Failed to load. Please try again.'**
  String get loadError;

  /// No description provided for @noResults.
  ///
  /// In en, this message translates to:
  /// **'No results found'**
  String get noResults;

  /// No description provided for @account.
  ///
  /// In en, this message translates to:
  /// **'Account'**
  String get account;

  /// No description provided for @qrScan.
  ///
  /// In en, this message translates to:
  /// **'QR Scan'**
  String get qrScan;

  /// No description provided for @bookingsAndTrips.
  ///
  /// In en, this message translates to:
  /// **'Bookings & Trips'**
  String get bookingsAndTrips;

  /// No description provided for @myTrips.
  ///
  /// In en, this message translates to:
  /// **'My Trips'**
  String get myTrips;

  /// No description provided for @savedHotels.
  ///
  /// In en, this message translates to:
  /// **'Saved Hotels'**
  String get savedHotels;

  /// No description provided for @walletAndRewards.
  ///
  /// In en, this message translates to:
  /// **'Wallet & Rewards'**
  String get walletAndRewards;

  /// No description provided for @wallet.
  ///
  /// In en, this message translates to:
  /// **'Wallet'**
  String get wallet;

  /// No description provided for @referral.
  ///
  /// In en, this message translates to:
  /// **'Referral'**
  String get referral;

  /// No description provided for @achievements.
  ///
  /// In en, this message translates to:
  /// **'Achievements'**
  String get achievements;

  /// No description provided for @offersAndRewards.
  ///
  /// In en, this message translates to:
  /// **'Offers & Rewards'**
  String get offersAndRewards;

  /// No description provided for @preferences.
  ///
  /// In en, this message translates to:
  /// **'Preferences'**
  String get preferences;

  /// No description provided for @help.
  ///
  /// In en, this message translates to:
  /// **'Help'**
  String get help;

  /// No description provided for @helpAndSupport.
  ///
  /// In en, this message translates to:
  /// **'Help & Support'**
  String get helpAndSupport;

  /// No description provided for @points.
  ///
  /// In en, this message translates to:
  /// **'Points'**
  String get points;

  /// No description provided for @guestUser.
  ///
  /// In en, this message translates to:
  /// **'Guest User'**
  String get guestUser;

  /// No description provided for @user.
  ///
  /// In en, this message translates to:
  /// **'User'**
  String get user;

  /// No description provided for @loginPrompt.
  ///
  /// In en, this message translates to:
  /// **'Login to access all features'**
  String get loginPrompt;

  /// No description provided for @homeGreeting.
  ///
  /// In en, this message translates to:
  /// **'Welcome! 👋'**
  String get homeGreeting;

  /// No description provided for @whereToStay.
  ///
  /// In en, this message translates to:
  /// **'Where will you stay today?'**
  String get whereToStay;

  /// No description provided for @firstBookingOffer.
  ///
  /// In en, this message translates to:
  /// **'First Booking Offer!'**
  String get firstBookingOffer;

  /// No description provided for @firstBookingDiscount.
  ///
  /// In en, this message translates to:
  /// **'Get 20% off your first stay'**
  String get firstBookingDiscount;

  /// No description provided for @limitedOffer.
  ///
  /// In en, this message translates to:
  /// **'Limited Offer'**
  String get limitedOffer;

  /// No description provided for @book.
  ///
  /// In en, this message translates to:
  /// **'Book'**
  String get book;

  /// No description provided for @popularHotels.
  ///
  /// In en, this message translates to:
  /// **'Popular Hotels'**
  String get popularHotels;

  /// No description provided for @noHotelsFound.
  ///
  /// In en, this message translates to:
  /// **'No hotels found'**
  String get noHotelsFound;

  /// No description provided for @filterNearby.
  ///
  /// In en, this message translates to:
  /// **'Nearby'**
  String get filterNearby;

  /// No description provided for @filterBudget.
  ///
  /// In en, this message translates to:
  /// **'Budget'**
  String get filterBudget;

  /// No description provided for @filterLuxury.
  ///
  /// In en, this message translates to:
  /// **'Luxury'**
  String get filterLuxury;

  /// No description provided for @filterCouple.
  ///
  /// In en, this message translates to:
  /// **'Couple'**
  String get filterCouple;

  /// No description provided for @cityDhaka.
  ///
  /// In en, this message translates to:
  /// **'Dhaka'**
  String get cityDhaka;

  /// No description provided for @cityChittagong.
  ///
  /// In en, this message translates to:
  /// **'Chittagong'**
  String get cityChittagong;

  /// No description provided for @cityCoxsBazar.
  ///
  /// In en, this message translates to:
  /// **'Cox\'s Bazar'**
  String get cityCoxsBazar;

  /// No description provided for @citySylhet.
  ///
  /// In en, this message translates to:
  /// **'Sylhet'**
  String get citySylhet;

  /// No description provided for @cityRajshahi.
  ///
  /// In en, this message translates to:
  /// **'Rajshahi'**
  String get cityRajshahi;

  /// No description provided for @cityKhulna.
  ///
  /// In en, this message translates to:
  /// **'Khulna'**
  String get cityKhulna;

  /// No description provided for @navHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navHome;

  /// No description provided for @navSearch.
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get navSearch;

  /// No description provided for @navBookings.
  ///
  /// In en, this message translates to:
  /// **'Bookings'**
  String get navBookings;

  /// No description provided for @navProfile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get navProfile;

  /// No description provided for @searchPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Search hotels or city...'**
  String get searchPlaceholder;

  /// No description provided for @hotelCountSuffix.
  ///
  /// In en, this message translates to:
  /// **'Hotels'**
  String get hotelCountSuffix;

  /// No description provided for @filterTitle.
  ///
  /// In en, this message translates to:
  /// **'Filters'**
  String get filterTitle;

  /// No description provided for @filterClearAll.
  ///
  /// In en, this message translates to:
  /// **'Clear All'**
  String get filterClearAll;

  /// No description provided for @filterPriceRange.
  ///
  /// In en, this message translates to:
  /// **'Price Range'**
  String get filterPriceRange;

  /// No description provided for @filterMinRating.
  ///
  /// In en, this message translates to:
  /// **'Min Rating'**
  String get filterMinRating;

  /// No description provided for @filterAmenities.
  ///
  /// In en, this message translates to:
  /// **'Amenities'**
  String get filterAmenities;

  /// No description provided for @filterCity.
  ///
  /// In en, this message translates to:
  /// **'City'**
  String get filterCity;

  /// No description provided for @filterApply.
  ///
  /// In en, this message translates to:
  /// **'Apply Filters'**
  String get filterApply;

  /// No description provided for @amenityWifi.
  ///
  /// In en, this message translates to:
  /// **'WiFi'**
  String get amenityWifi;

  /// No description provided for @amenityAC.
  ///
  /// In en, this message translates to:
  /// **'AC'**
  String get amenityAC;

  /// No description provided for @amenityTV.
  ///
  /// In en, this message translates to:
  /// **'TV'**
  String get amenityTV;

  /// No description provided for @amenityParking.
  ///
  /// In en, this message translates to:
  /// **'Parking'**
  String get amenityParking;

  /// No description provided for @amenityPool.
  ///
  /// In en, this message translates to:
  /// **'Pool'**
  String get amenityPool;

  /// No description provided for @amenityRestaurant.
  ///
  /// In en, this message translates to:
  /// **'Restaurant'**
  String get amenityRestaurant;

  /// No description provided for @amenityGym.
  ///
  /// In en, this message translates to:
  /// **'Gym'**
  String get amenityGym;

  /// No description provided for @amenityRoomService.
  ///
  /// In en, this message translates to:
  /// **'Room Service'**
  String get amenityRoomService;

  /// No description provided for @searchHeaderTitle.
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get searchHeaderTitle;

  /// No description provided for @searchHeaderSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Find your favorite hotel'**
  String get searchHeaderSubtitle;

  /// No description provided for @searchSuggestions.
  ///
  /// In en, this message translates to:
  /// **'Suggestions'**
  String get searchSuggestions;

  /// No description provided for @searchPopularDestinations.
  ///
  /// In en, this message translates to:
  /// **'Popular Destinations'**
  String get searchPopularDestinations;

  /// No description provided for @searchAllHotels.
  ///
  /// In en, this message translates to:
  /// **'View All Hotels'**
  String get searchAllHotels;

  /// No description provided for @searchTipsTitle.
  ///
  /// In en, this message translates to:
  /// **'Search Tips'**
  String get searchTipsTitle;

  /// No description provided for @searchTipNearMe.
  ///
  /// In en, this message translates to:
  /// **'Use \"Near Me\" to find nearby hotels'**
  String get searchTipNearMe;

  /// No description provided for @searchTipBudget.
  ///
  /// In en, this message translates to:
  /// **'Filter by Budget (≤৳3000) or Premium (≥৳8000)'**
  String get searchTipBudget;

  /// No description provided for @searchResultsError.
  ///
  /// In en, this message translates to:
  /// **'Problem searching'**
  String get searchResultsError;

  /// No description provided for @searchClear.
  ///
  /// In en, this message translates to:
  /// **'Clear'**
  String get searchClear;

  /// No description provided for @searchLocationFound.
  ///
  /// In en, this message translates to:
  /// **'Location found'**
  String get searchLocationFound;

  /// No description provided for @searchLocationError.
  ///
  /// In en, this message translates to:
  /// **'Location service disabled'**
  String get searchLocationError;

  /// No description provided for @searchTryAgain.
  ///
  /// In en, this message translates to:
  /// **'Try Again'**
  String get searchTryAgain;

  /// No description provided for @bookingsTitle.
  ///
  /// In en, this message translates to:
  /// **'My Bookings'**
  String get bookingsTitle;

  /// No description provided for @bookingsSubtitleSuffix.
  ///
  /// In en, this message translates to:
  /// **'bookings found'**
  String get bookingsSubtitleSuffix;

  /// No description provided for @tabUpcoming.
  ///
  /// In en, this message translates to:
  /// **'Upcoming'**
  String get tabUpcoming;

  /// No description provided for @tabCompleted.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get tabCompleted;

  /// No description provided for @tabCancelled.
  ///
  /// In en, this message translates to:
  /// **'Cancelled'**
  String get tabCancelled;

  /// No description provided for @emptyUpcomingTitle.
  ///
  /// In en, this message translates to:
  /// **'No Upcoming Bookings'**
  String get emptyUpcomingTitle;

  /// No description provided for @emptyUpcomingSubtitle.
  ///
  /// In en, this message translates to:
  /// **'You don\'t have any upcoming trips planned.'**
  String get emptyUpcomingSubtitle;

  /// No description provided for @emptyCompletedTitle.
  ///
  /// In en, this message translates to:
  /// **'No Completed Bookings'**
  String get emptyCompletedTitle;

  /// No description provided for @emptyCompletedSubtitle.
  ///
  /// In en, this message translates to:
  /// **'You haven\'t completed any trips yet.'**
  String get emptyCompletedSubtitle;

  /// No description provided for @emptyCancelledTitle.
  ///
  /// In en, this message translates to:
  /// **'No Cancelled Bookings'**
  String get emptyCancelledTitle;

  /// No description provided for @emptyCancelledSubtitle.
  ///
  /// In en, this message translates to:
  /// **'You have no cancelled bookings.'**
  String get emptyCancelledSubtitle;

  /// No description provided for @findHotelsButton.
  ///
  /// In en, this message translates to:
  /// **'Find Hotels'**
  String get findHotelsButton;

  /// No description provided for @loginWelcome.
  ///
  /// In en, this message translates to:
  /// **'Welcome!'**
  String get loginWelcome;

  /// No description provided for @loginSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Login to your account'**
  String get loginSubtitle;

  /// No description provided for @googleLogin.
  ///
  /// In en, this message translates to:
  /// **'Login with Google'**
  String get googleLogin;

  /// No description provided for @orDivider.
  ///
  /// In en, this message translates to:
  /// **'OR'**
  String get orDivider;

  /// No description provided for @phoneInputLabel.
  ///
  /// In en, this message translates to:
  /// **'Phone Number / Email'**
  String get phoneInputLabel;

  /// No description provided for @passwordInputLabel.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get passwordInputLabel;

  /// No description provided for @loginButton.
  ///
  /// In en, this message translates to:
  /// **'Login'**
  String get loginButton;

  /// No description provided for @forgotPassword.
  ///
  /// In en, this message translates to:
  /// **'Forgot Password?'**
  String get forgotPassword;

  /// No description provided for @noAccount.
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account?'**
  String get noAccount;

  /// No description provided for @registerLink.
  ///
  /// In en, this message translates to:
  /// **'Register'**
  String get registerLink;

  /// No description provided for @loginSuccess.
  ///
  /// In en, this message translates to:
  /// **'Login successful!'**
  String get loginSuccess;

  /// No description provided for @loginError.
  ///
  /// In en, this message translates to:
  /// **'Phone number and password required'**
  String get loginError;

  /// No description provided for @stepDate.
  ///
  /// In en, this message translates to:
  /// **'Date Selection'**
  String get stepDate;

  /// No description provided for @stepGuest.
  ///
  /// In en, this message translates to:
  /// **'Guest Info'**
  String get stepGuest;

  /// No description provided for @stepPayment.
  ///
  /// In en, this message translates to:
  /// **'Payment'**
  String get stepPayment;

  /// No description provided for @datesLabel.
  ///
  /// In en, this message translates to:
  /// **'Check-in & Check-out Date'**
  String get datesLabel;

  /// No description provided for @guestNameLabel.
  ///
  /// In en, this message translates to:
  /// **'Guest Name'**
  String get guestNameLabel;

  /// No description provided for @guestNameHint.
  ///
  /// In en, this message translates to:
  /// **'Enter full name'**
  String get guestNameHint;

  /// No description provided for @guestPhoneLabel.
  ///
  /// In en, this message translates to:
  /// **'Phone Number'**
  String get guestPhoneLabel;

  /// No description provided for @guestPhoneHint.
  ///
  /// In en, this message translates to:
  /// **'01XXXXXXXXX'**
  String get guestPhoneHint;

  /// No description provided for @guestEmailLabel.
  ///
  /// In en, this message translates to:
  /// **'Email (Optional)'**
  String get guestEmailLabel;

  /// No description provided for @guestEmailHint.
  ///
  /// In en, this message translates to:
  /// **'example@email.com'**
  String get guestEmailHint;

  /// No description provided for @guestCountLabel.
  ///
  /// In en, this message translates to:
  /// **'Number of Guests'**
  String get guestCountLabel;

  /// No description provided for @maxGuestsLabel.
  ///
  /// In en, this message translates to:
  /// **'Max 4 people'**
  String get maxGuestsLabel;

  /// No description provided for @roomRent.
  ///
  /// In en, this message translates to:
  /// **'Room Rent'**
  String get roomRent;

  /// No description provided for @tax.
  ///
  /// In en, this message translates to:
  /// **'Tax'**
  String get tax;

  /// No description provided for @total.
  ///
  /// In en, this message translates to:
  /// **'Total'**
  String get total;

  /// No description provided for @advancePaymentMessage.
  ///
  /// In en, this message translates to:
  /// **'Pay only 20% advance now: {amount}'**
  String advancePaymentMessage(Object amount);

  /// No description provided for @paymentMethod.
  ///
  /// In en, this message translates to:
  /// **'Payment Method'**
  String get paymentMethod;

  /// No description provided for @payAtHotel.
  ///
  /// In en, this message translates to:
  /// **'Pay at Hotel'**
  String get payAtHotel;

  /// No description provided for @payAtHotelSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Pay 20% now, rest at hotel'**
  String get payAtHotelSubtitle;

  /// No description provided for @bkash.
  ///
  /// In en, this message translates to:
  /// **'bKash'**
  String get bkash;

  /// No description provided for @bkashSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Full payment now'**
  String get bkashSubtitle;

  /// No description provided for @nagad.
  ///
  /// In en, this message translates to:
  /// **'Nagad'**
  String get nagad;

  /// No description provided for @nagadSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Full payment now'**
  String get nagadSubtitle;

  /// No description provided for @card.
  ///
  /// In en, this message translates to:
  /// **'Card'**
  String get card;

  /// No description provided for @cardSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Credit/Debit Card'**
  String get cardSubtitle;

  /// No description provided for @bookingSuccessTitle.
  ///
  /// In en, this message translates to:
  /// **'Booking Confirmed!'**
  String get bookingSuccessTitle;

  /// No description provided for @bookingSuccessMessage.
  ///
  /// In en, this message translates to:
  /// **'Your booking has been successfully confirmed.'**
  String get bookingSuccessMessage;

  /// No description provided for @viewMyBookings.
  ///
  /// In en, this message translates to:
  /// **'View My Bookings'**
  String get viewMyBookings;

  /// No description provided for @bookingError.
  ///
  /// In en, this message translates to:
  /// **'Failed to book. Please try again.'**
  String get bookingError;

  /// No description provided for @detailsAbout.
  ///
  /// In en, this message translates to:
  /// **'About Hotel'**
  String get detailsAbout;

  /// No description provided for @detailsAmenities.
  ///
  /// In en, this message translates to:
  /// **'Amenities'**
  String get detailsAmenities;

  /// No description provided for @detailsDescription.
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get detailsDescription;

  /// No description provided for @detailsRooms.
  ///
  /// In en, this message translates to:
  /// **'Available Rooms'**
  String get detailsRooms;

  /// No description provided for @selectRoom.
  ///
  /// In en, this message translates to:
  /// **'Select Room'**
  String get selectRoom;

  /// No description provided for @night.
  ///
  /// In en, this message translates to:
  /// **'night'**
  String get night;

  /// No description provided for @selectDateMessage.
  ///
  /// In en, this message translates to:
  /// **'Please select dates'**
  String get selectDateMessage;

  /// No description provided for @checkoutDateMessage.
  ///
  /// In en, this message translates to:
  /// **'Check-out date must be after check-in date'**
  String get checkoutDateMessage;

  /// No description provided for @enterGuestNameMessage.
  ///
  /// In en, this message translates to:
  /// **'Please enter guest name'**
  String get enterGuestNameMessage;

  /// No description provided for @enterPhoneMessage.
  ///
  /// In en, this message translates to:
  /// **'Please enter phone number'**
  String get enterPhoneMessage;

  /// No description provided for @next.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get next;

  /// No description provided for @previous.
  ///
  /// In en, this message translates to:
  /// **'Previous'**
  String get previous;

  /// No description provided for @shareHotelText.
  ///
  /// In en, this message translates to:
  /// **'Check out this hotel: {hotelName} - {link}'**
  String shareHotelText(Object hotelName, Object link);

  /// No description provided for @hotelDetailsTitle.
  ///
  /// In en, this message translates to:
  /// **'Hotel Details'**
  String get hotelDetailsTitle;

  /// No description provided for @roomsCount.
  ///
  /// In en, this message translates to:
  /// **'{count} rooms'**
  String roomsCount(Object count);

  /// No description provided for @errorLoadingRooms.
  ///
  /// In en, this message translates to:
  /// **'Error loading rooms'**
  String get errorLoadingRooms;

  /// No description provided for @noRoomsFound.
  ///
  /// In en, this message translates to:
  /// **'No rooms found'**
  String get noRoomsFound;

  /// No description provided for @selectRoomSnackbar.
  ///
  /// In en, this message translates to:
  /// **'Please scroll up to select a room'**
  String get selectRoomSnackbar;

  /// No description provided for @errorLoadingHotel.
  ///
  /// In en, this message translates to:
  /// **'Error loading hotel'**
  String get errorLoadingHotel;

  /// No description provided for @capacityText.
  ///
  /// In en, this message translates to:
  /// **'{count} Guests'**
  String capacityText(Object count);

  /// No description provided for @bedDouble.
  ///
  /// In en, this message translates to:
  /// **'1 Double Bed'**
  String get bedDouble;

  /// No description provided for @bedTwin.
  ///
  /// In en, this message translates to:
  /// **'2 Single Beds'**
  String get bedTwin;

  /// No description provided for @bedSingle.
  ///
  /// In en, this message translates to:
  /// **'1 Single Bed'**
  String get bedSingle;

  /// No description provided for @bedDefault.
  ///
  /// In en, this message translates to:
  /// **'1 Bed'**
  String get bedDefault;

  /// No description provided for @goodMorning.
  ///
  /// In en, this message translates to:
  /// **'Good Morning'**
  String get goodMorning;

  /// No description provided for @goodAfternoon.
  ///
  /// In en, this message translates to:
  /// **'Good Afternoon'**
  String get goodAfternoon;

  /// No description provided for @goodEvening.
  ///
  /// In en, this message translates to:
  /// **'Good Evening'**
  String get goodEvening;

  /// No description provided for @goodNight.
  ///
  /// In en, this message translates to:
  /// **'Good Night'**
  String get goodNight;

  /// No description provided for @flashDeals.
  ///
  /// In en, this message translates to:
  /// **'Flash Deals'**
  String get flashDeals;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['bn', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'bn':
      return AppLocalizationsBn();
    case 'en':
      return AppLocalizationsEn();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
