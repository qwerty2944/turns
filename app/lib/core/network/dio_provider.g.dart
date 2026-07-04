// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dio_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(dio)
final dioProvider = DioProvider._();

final class DioProvider extends $FunctionalProvider<Dio, Dio, Dio>
    with $Provider<Dio> {
  DioProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'dioProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$dioHash();

  @$internal
  @override
  $ProviderElement<Dio> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  Dio create(Ref ref) {
    return dio(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(Dio value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<Dio>(value),
    );
  }
}

String _$dioHash() => r'85e2b921369cec8e496d2332b67b61ff1f34d52f';

/// Bumped when the server rejects our token (logged in elsewhere). The auth
/// notifier listens and drops to the login screen with a notice.

@ProviderFor(SessionRevoked)
final sessionRevokedProvider = SessionRevokedProvider._();

/// Bumped when the server rejects our token (logged in elsewhere). The auth
/// notifier listens and drops to the login screen with a notice.
final class SessionRevokedProvider
    extends $NotifierProvider<SessionRevoked, int> {
  /// Bumped when the server rejects our token (logged in elsewhere). The auth
  /// notifier listens and drops to the login screen with a notice.
  SessionRevokedProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'sessionRevokedProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$sessionRevokedHash();

  @$internal
  @override
  SessionRevoked create() => SessionRevoked();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(int value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<int>(value),
    );
  }
}

String _$sessionRevokedHash() => r'138e4ab9e336898bac58768e22dc1d15cf305f12';

/// Bumped when the server rejects our token (logged in elsewhere). The auth
/// notifier listens and drops to the login screen with a notice.

abstract class _$SessionRevoked extends $Notifier<int> {
  int build();
  @$mustCallSuper
  @override
  WhenComplete runBuild() {
    final ref = this.ref as $Ref<int, int>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<int, int>,
              int,
              Object?,
              Object?
            >;
    return element.handleCreate(ref, build);
  }
}
