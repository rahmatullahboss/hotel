import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  final repositoryRoot = Directory.current.parent.parent;
  final workflowFile = File(
    '${repositoryRoot.path}/.github/workflows/flutter-release.yml',
  );
  final pubspecFile = File('${Directory.current.path}/pubspec.yaml');
  final analysisOptionsFile = File(
    '${Directory.current.path}/analysis_options.yaml',
  );

  test('Flutter workflow enforces strict quality commands', () {
    expect(workflowFile.existsSync(), isTrue);
    final workflow = workflowFile.readAsStringSync();

    expect(
      workflow,
      contains('dart format --output=none --set-exit-if-changed lib test'),
    );
    expect(workflow, contains('flutter analyze'));
    expect(workflow, contains('flutter test --coverage'));
    expect(workflow, contains('flutter build apk --debug'));
    expect(workflow, isNot(contains('--no-fatal-infos')));
    expect(workflow, isNot(contains('--no-fatal-warnings')));
    expect(workflow, isNot(contains('continue-on-error: true')));
    expect(workflow, isNot(contains('|| echo')));
  });

  test('Flutter test and lint dependencies remain configured', () {
    expect(pubspecFile.existsSync(), isTrue);
    expect(analysisOptionsFile.existsSync(), isTrue);

    final pubspec = pubspecFile.readAsStringSync();
    final analysisOptions = analysisOptionsFile.readAsStringSync();

    expect(pubspec, contains('flutter_test:'));
    expect(pubspec, contains('flutter_lints:'));
    expect(
      analysisOptions,
      contains('include: package:flutter_lints/flutter.yaml'),
    );
  });

  test('Release workflow fails closed for missing signing material', () {
    final workflow = workflowFile.readAsStringSync();

    for (final secret in <String>[
      'KEYSTORE_BASE64',
      'KEYSTORE_PASSWORD',
      'KEY_PASSWORD',
      'KEY_ALIAS',
    ]) {
      expect(workflow, contains(secret));
    }

    expect(workflow, contains('Required signing secret'));
    expect(workflow, contains('if-no-files-found: error'));
    expect(workflow, contains('fail_on_unmatched_files: true'));
  });

  test('Temporary write-enabled maintenance workflows are absent', () {
    for (final fileName in <String>[
      'flutter-autofix.yml',
      'flutter-targeted-fix.yml',
    ]) {
      final temporaryWorkflow = File(
        '${repositoryRoot.path}/.github/workflows/$fileName',
      );
      expect(
        temporaryWorkflow.existsSync(),
        isFalse,
        reason: '$fileName must not be committed to the final CI branch',
      );
    }
  });
}
