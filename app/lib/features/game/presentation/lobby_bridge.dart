import 'package:meta/meta.dart';

/// Normalized pre-game lobby snapshot pushed from the hidden WebView page
/// via the `turnsState` JS handler (see frontend appBridge.ts).
@immutable
class LobbyPlayer {
  const LobbyPlayer({
    required this.sid,
    required this.nickname,
    required this.faction,
    required this.ready,
    required this.connected,
  });

  final String sid;
  final String nickname;
  final String faction; // '' | 'ruling' | 'opposition'
  final bool ready;
  final bool connected;

  factory LobbyPlayer.fromJson(Map<String, dynamic> j) => LobbyPlayer(
        sid: (j['sid'] ?? '') as String,
        nickname: (j['nickname'] ?? '') as String,
        faction: (j['faction'] ?? '') as String,
        ready: (j['ready'] ?? false) as bool,
        connected: (j['connected'] ?? true) as bool,
      );
}

@immutable
class LobbyLogEntry {
  const LobbyLogEntry({
    required this.ts,
    required this.kind,
    required this.text,
    required this.actor,
  });

  final int ts;
  final String kind; // system|turn|play|combat|result|info
  final String text;
  final String actor;

  factory LobbyLogEntry.fromJson(Map<String, dynamic> j) => LobbyLogEntry(
        ts: (j['ts'] ?? 0) as int,
        kind: (j['kind'] ?? 'info') as String,
        text: (j['text'] ?? '') as String,
        actor: (j['actor'] ?? '') as String,
      );

  bool get isChat => text.startsWith('💬');
}

@immutable
class LobbySnap {
  const LobbySnap({
    required this.game,
    required this.phase,
    required this.meSid,
    required this.hostSid,
    required this.players,
    required this.log,
  });

  final String game;
  final String phase; // lobby | playing | gameEnd
  final String meSid;
  final String hostSid;
  final List<LobbyPlayer> players;
  final List<LobbyLogEntry> log;

  bool get isHost => meSid.isNotEmpty && meSid == hostSid;

  LobbyPlayer? get me {
    for (final p in players) {
      if (p.sid == meSid) return p;
    }
    return null;
  }

  factory LobbySnap.fromJson(Map<String, dynamic> j) => LobbySnap(
        game: (j['game'] ?? '') as String,
        phase: (j['phase'] ?? 'lobby') as String,
        meSid: (j['meSid'] ?? '') as String,
        hostSid: (j['hostSid'] ?? '') as String,
        players: ((j['players'] ?? []) as List)
            .whereType<Map>()
            .map((e) => LobbyPlayer.fromJson(Map<String, dynamic>.from(e)))
            .toList(),
        log: ((j['log'] ?? []) as List)
            .whereType<Map>()
            .map((e) => LobbyLogEntry.fromJson(Map<String, dynamic>.from(e)))
            .toList(),
      );
}
