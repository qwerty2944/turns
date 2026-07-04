import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';

/// Password input with an eye toggle to reveal/hide the text.
class PasswordField extends StatefulWidget {
  const PasswordField({
    super.key,
    required this.controller,
    this.hintText = '••••••••',
    this.textInputAction = TextInputAction.done,
    this.onSubmitted,
  });

  final TextEditingController controller;
  final String hintText;
  final TextInputAction textInputAction;
  final ValueChanged<String>? onSubmitted;

  @override
  State<PasswordField> createState() => _PasswordFieldState();
}

class _PasswordFieldState extends State<PasswordField> {
  bool _obscure = true;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: widget.controller,
      obscureText: _obscure,
      autocorrect: false,
      enableSuggestions: false,
      style: const TextStyle(fontSize: 15),
      decoration: InputDecoration(
        hintText: widget.hintText,
        suffixIcon: IconButton(
          onPressed: () => setState(() => _obscure = !_obscure),
          icon: Icon(
            _obscure ? Icons.visibility_off : Icons.visibility,
            size: 20,
            color: _obscure ? AppColors.muted : AppColors.gold,
          ),
          tooltip: _obscure ? '비밀번호 보기' : '비밀번호 숨기기',
        ),
      ),
      textInputAction: widget.textInputAction,
      onSubmitted: widget.onSubmitted,
    );
  }
}
