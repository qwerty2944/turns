import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import 'auth_dtos.dart';

part 'auth_api.g.dart';

@RestApi()
abstract class AuthApi {
  factory AuthApi(Dio dio) = _AuthApi;

  // Bodies are passed as maps (dto.toJson()) — retrofit_generator emitted
  // `_data = body` for the freezed DTOs, which dio then sent as
  // `toString()` text/plain and the server saw an empty body.

  @POST('/auth/login')
  Future<AuthResponse> login(@Body() Map<String, dynamic> body);

  @POST('/auth/signup')
  Future<AuthResponse> signup(@Body() Map<String, dynamic> body);

  @GET('/auth/me')
  Future<MeResponse> me();
}
