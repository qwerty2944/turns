import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import 'auth_notifier.dart';
import 'widgets/password_field.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_busy) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    final failure = await ref
        .read(authProvider.notifier)
        .login(_email.text.trim(), _password.text);
    if (!mounted) return;
    setState(() => _busy = false);
    if (failure != null) {
      setState(() => _error = failure.userMessage);
    }
    // Success: router redirect sends us to /lobby.
  }

  @override
  Widget build(BuildContext context) {
    // 다른 기기 로그인으로 세션이 끊겨 돌아온 경우 안내 배너.
    final auth = ref.watch(authProvider);
    final revoked = auth is AuthUnauthenticated && auth.revoked;

    return Scaffold(
      body: Stack(
        children: [
          const _PixelStarfield(),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // ── 타이틀 로고 ──
                      const _PixelLogo(),
                      const SizedBox(height: 8),
                      const Text(
                        '─ 보드게임 온라인 매칭 ─',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: AppColors.muted,
                          fontSize: 13,
                          letterSpacing: 2,
                        ),
                      ),
                      const SizedBox(height: 28),

                      if (revoked)
                        Container(
                          margin: const EdgeInsets.only(bottom: 14),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.danger.withValues(alpha: 0.12),
                            border: Border.all(color: AppColors.danger, width: 2),
                          ),
                          child: const Text(
                            '⚠ 다른 기기에서 로그인되어\n이 기기의 세션이 종료되었습니다',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                                color: AppColors.danger,
                                fontSize: 12,
                                height: 1.6),
                          ),
                        ),

                      // ── 픽셀 패널 ──
                      _PixelPanel(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const _FieldLabel('이메일'),
                            const SizedBox(height: 6),
                            TextField(
                              controller: _email,
                              keyboardType: TextInputType.emailAddress,
                              autocorrect: false,
                              style: const TextStyle(fontSize: 15),
                              decoration:
                                  const InputDecoration(hintText: 'you@turns.gg'),
                              textInputAction: TextInputAction.next,
                            ),
                            const SizedBox(height: 16),
                            const _FieldLabel('비밀번호'),
                            const SizedBox(height: 6),
                            PasswordField(
                              controller: _password,
                              onSubmitted: (_) => _submit(),
                            ),
                            if (_error != null) ...[
                              const SizedBox(height: 14),
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color:
                                      AppColors.danger.withValues(alpha: 0.1),
                                  border: Border.all(
                                      color: AppColors.danger, width: 1.5),
                                ),
                                child: Text(
                                  '! $_error',
                                  style: const TextStyle(
                                      color: AppColors.danger,
                                      fontSize: 12,
                                      height: 1.5),
                                ),
                              ),
                            ],
                            const SizedBox(height: 20),
                            _PixelButton(
                              label: _busy ? '접속 중...' : '▶ 게임 시작',
                              busy: _busy,
                              onPressed: _busy ? null : _submit,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),
                      TextButton(
                        onPressed: () => context.push('/signup'),
                        child: const Text(
                          '처음이신가요? + 새 계정 만들기',
                          style: TextStyle(fontSize: 13),
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        '웹 유저와 같은 방에서 만나요 · 크로스플레이 지원',
                        textAlign: TextAlign.center,
                        style:
                            TextStyle(color: AppColors.muted, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── 픽셀 타이틀: 계단식 그림자의 큰 도트 로고 + 카드 이모지 ──
class _PixelLogo extends StatelessWidget {
  const _PixelLogo();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Text('🃏🎲', style: TextStyle(fontSize: 34)),
        const SizedBox(height: 10),
        Stack(
          alignment: Alignment.center,
          children: [
            // 계단식 그림자 (도트 감성)
            Transform.translate(
              offset: const Offset(4, 4),
              child: const Text(
                '턴 즈',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'Galmuri11',
                  fontWeight: FontWeight.w700,
                  fontSize: 46,
                  letterSpacing: 6,
                  color: Color(0xFF3A2B6E),
                ),
              ),
            ),
            const Text(
              '턴 즈',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Galmuri11',
                fontWeight: FontWeight.w700,
                fontSize: 46,
                letterSpacing: 6,
                color: AppColors.accent,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

// ── 픽셀 패널: 이중 보더 + 계단 그림자 ──
class _PixelPanel extends StatelessWidget {
  const _PixelPanel({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.panel,
        border: Border(
          top: BorderSide(color: AppColors.panelBorder, width: 3),
          left: BorderSide(color: AppColors.panelBorder, width: 3),
          right: BorderSide(color: Color(0xFF120C30), width: 3),
          bottom: BorderSide(color: Color(0xFF120C30), width: 3),
        ),
        boxShadow: [
          BoxShadow(color: Color(0xFF0A0618), offset: Offset(6, 6)),
        ],
      ),
      padding: const EdgeInsets.all(22),
      child: child,
    );
  }
}

class _FieldLabel extends StatelessWidget {
  const _FieldLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      '◆ $text',
      style: const TextStyle(
        color: AppColors.gold,
        fontSize: 12,
        fontWeight: FontWeight.w700,
        letterSpacing: 1,
      ),
    );
  }
}

// ── 픽셀 버튼: 눌림 오프셋 + 계단 그림자 ──
class _PixelButton extends StatefulWidget {
  const _PixelButton({required this.label, required this.onPressed, this.busy = false});

  final String label;
  final VoidCallback? onPressed;
  final bool busy;

  @override
  State<_PixelButton> createState() => _PixelButtonState();
}

class _PixelButtonState extends State<_PixelButton> {
  bool _down = false;

  @override
  Widget build(BuildContext context) {
    final enabled = widget.onPressed != null;
    return GestureDetector(
      onTapDown: enabled ? (_) => setState(() => _down = true) : null,
      onTapCancel: () => setState(() => _down = false),
      onTapUp: enabled
          ? (_) {
              setState(() => _down = false);
              widget.onPressed?.call();
            }
          : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 60),
        transform: Matrix4.translationValues(
            _down ? 3 : 0, _down ? 3 : 0, 0),
        padding: const EdgeInsets.symmetric(vertical: 15),
        decoration: BoxDecoration(
          color: enabled ? AppColors.accent : AppColors.muted,
          border: Border.all(color: const Color(0xFF0A0618), width: 2),
          boxShadow: _down
              ? const []
              : const [
                  BoxShadow(color: Color(0xFF8a7440), offset: Offset(4, 4)),
                ],
        ),
        child: Center(
          child: widget.busy
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                      strokeWidth: 2.5, color: Color(0xFF1A1233)),
                )
              : Text(
                  widget.label,
                  style: const TextStyle(
                    color: Color(0xFF1A1233),
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                    letterSpacing: 2,
                  ),
                ),
        ),
      ),
    );
  }
}

// ── 배경: 은은히 깜빡이는 픽셀 별밭 ──
class _PixelStarfield extends StatefulWidget {
  const _PixelStarfield();

  @override
  State<_PixelStarfield> createState() => _PixelStarfieldState();
}

class _PixelStarfieldState extends State<_PixelStarfield>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c =
      AnimationController(vsync: this, duration: const Duration(seconds: 4))
        ..repeat();
  final _stars = List.generate(60, (i) {
    final rnd = Random(i * 7919);
    return (
      x: rnd.nextDouble(),
      y: rnd.nextDouble(),
      size: 1.5 + rnd.nextDouble() * 2.5,
      phase: rnd.nextDouble() * 2 * pi,
    );
  });

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _c,
      builder: (context, _) => CustomPaint(
        size: Size.infinite,
        painter: _StarPainter(_stars, _c.value),
      ),
    );
  }
}

class _StarPainter extends CustomPainter {
  _StarPainter(this.stars, this.t);

  final List<({double x, double y, double size, double phase})> stars;
  final double t;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint();
    for (final s in stars) {
      final tw = 0.25 + 0.75 * (0.5 + 0.5 * sin(2 * pi * t + s.phase));
      paint.color = const Color(0xFFF1D999).withValues(alpha: 0.35 * tw);
      canvas.drawRect(
        Rect.fromLTWH(s.x * size.width, s.y * size.height, s.size, s.size),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _StarPainter old) => old.t != t;
}
