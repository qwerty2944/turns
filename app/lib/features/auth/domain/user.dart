import 'package:flutter/foundation.dart';

/// Plain immutable model — hand-written json so both `id` (login/signup)
/// and the legacy `userId` (older /auth/me) server shapes parse.
@immutable
class User {
  const User({required this.id, required this.email, required this.nickname});

  final int id;
  final String email;
  final String nickname;

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: (json['id'] ?? json['userId'] ?? 0) as int,
        email: (json['email'] ?? '') as String,
        nickname: (json['nickname'] ?? '') as String,
      );

  Map<String, dynamic> toJson() =>
      {'id': id, 'email': email, 'nickname': nickname};

  @override
  bool operator ==(Object other) =>
      other is User &&
      other.id == id &&
      other.email == email &&
      other.nickname == nickname;

  @override
  int get hashCode => Object.hash(id, email, nickname);
}
