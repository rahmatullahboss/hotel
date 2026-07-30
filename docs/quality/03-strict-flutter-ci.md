# Strict Flutter CI and Android Release Gates

Workstream: `CI-02`

## Objectives

The Flutter workflow must provide real evidence for formatting, static analysis, tests and Android compilation. It must never transform a failed test or missing release artifact into a successful check.

Workflow: `.github/workflows/flutter-release.yml`

## Pull-request gates

Every pull request to `main` that changes the Flutter app or workflow must report:

1. `Flutter CI/CD / Format, analyze and test`
2. `Flutter CI/CD / Android debug build`

The quality job runs:

```bash
flutter pub get
git diff --exit-code -- pubspec.lock
dart format --output=none --set-exit-if-changed lib test
flutter analyze
flutter test --coverage
```

It also fails when no committed `*_test.dart` file exists and uploads the generated LCOV file with `if-no-files-found: error`.

The debug-build job depends on the quality job and runs:

```bash
flutter build apk --debug
```

A debug APK is used for pull-request compilation evidence because it does not require exposing signing credentials to pull-request jobs.

## Signed releases

Signed release builds run only for version tags or explicit manual dispatch. They require these GitHub Actions secrets:

- `KEYSTORE_BASE64`
- `KEYSTORE_PASSWORD`
- `KEY_PASSWORD`
- `KEY_ALIAS`

The workflow checks every required secret and fails before dependency resolution/building when any value is absent. Signing material is written only inside the runner and removed in an `always()` cleanup step.

Manual releases may choose APK, app bundle or both. Version tags build both outputs so the GitHub release job can require and attach both files.

## Release integrity

Release artifacts are mandatory:

- artifact uploads use `if-no-files-found: error`;
- artifact downloads do not use `continue-on-error`;
- GitHub release creation uses `fail_on_unmatched_files: true`;
- release creation depends on the signed-build job.

## False-green prohibitions

The workflow may not contain:

- `flutter analyze --no-fatal-infos`;
- `flutter analyze --no-fatal-warnings`;
- `flutter test ... || echo`;
- `continue-on-error: true` for required artifacts or checks;
- optional success when tests, signing secrets or expected artifacts are absent.

## Test baseline

`apps/mobile-flutter/test/ci/workflow_contract_test.dart` establishes the initial executable test baseline and protects the CI contract. Product workstreams must add unit, widget and integration tests for changed application behaviour; CI-02 does not claim complete mobile test coverage.

## Branch protection

After a successful pull-request run, require these exact checks on `main`:

- `Flutter CI/CD / Format, analyze and test`
- `Flutter CI/CD / Android debug build`

Tag/manual signed release jobs are deployment evidence and should not be required on ordinary pull requests.

## Local reproduction

From the Flutter app directory using Flutter 3.38.5 and Java 17:

```bash
flutter pub get
dart format --output=none --set-exit-if-changed lib test
flutter analyze
flutter test --coverage
flutter build apk --debug
```

Release signing should be verified only in an approved secrets-enabled environment. Never commit the keystore or `android/key.properties`.
