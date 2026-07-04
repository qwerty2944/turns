import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../config/env.dart';
import '../storage/token_storage.dart';

part 'dio_provider.g.dart';

@Riverpod(keepAlive: true)
Dio dio(Ref ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: Env.backendUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final storage = await ref.read(tokenStorageProvider.future);
        final token = storage.token;
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (e, handler) async {
        // 401 outside the login/signup flow means the session was revoked —
        // e.g. the same account logged in elsewhere (single-session policy:
        // every login bumps tokenVersion server-side, invalidating old JWTs).
        final path = e.requestOptions.path;
        final isAuthCall =
            path.contains('/auth/login') || path.contains('/auth/signup');
        if (e.response?.statusCode == 401 && !isAuthCall) {
          final storage = await ref.read(tokenStorageProvider.future);
          await storage.clear();
          ref.read(sessionRevokedProvider.notifier).markRevoked();
        }
        handler.next(e);
      },
    ),
  );

  return dio;
}

/// Bumped when the server rejects our token (logged in elsewhere). The auth
/// notifier listens and drops to the login screen with a notice.
@Riverpod(keepAlive: true)
class SessionRevoked extends _$SessionRevoked {
  @override
  int build() => 0;

  void markRevoked() => state++;
}
