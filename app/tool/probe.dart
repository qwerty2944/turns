// Serialization probe: what does the generated retrofit client actually
// send? Run: fvm dart run tool/probe.dart (backend on localhost:2567)
import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:turns_app/features/auth/data/auth_api.dart';
import 'package:turns_app/features/auth/data/auth_dtos.dart';

Future<void> main() async {
  final dio = Dio(BaseOptions(baseUrl: 'http://localhost:2567'));
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (o, h) {
        // ignore: avoid_print
        print('>> ${o.method} ${o.path} data=${o.data} '
            'runtimeType=${o.data.runtimeType} encoded=${_tryEncode(o.data)}');
        h.next(o);
      },
    ),
  );
  final api = AuthApi(dio);
  try {
    final res = await api.signup(SignupRequest(
      email: 'probe${DateTime.now().millisecondsSinceEpoch}@test.local',
      password: 'test1234',
      passwordConfirm: 'test1234',
      nickname: '프로브',
    ).toJson());
    // ignore: avoid_print
    print('OK: user=${res.user.toJson()}');
  } on DioException catch (e) {
    // ignore: avoid_print
    print('FAIL ${e.response?.statusCode}: ${e.response?.data}');
  }
}

String _tryEncode(dynamic d) {
  try {
    return jsonEncode(d);
  } catch (e) {
    return 'ENCODE-ERROR: $e';
  }
}
