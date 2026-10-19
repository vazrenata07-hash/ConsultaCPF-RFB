import socket
import sys
import time
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from consulta_cpf_rfb import App, CDP, IPChanged

class IPRestartTests(unittest.TestCase):
    def test_ip_change_interrupts_silent_browser(self):
        left, right = socket.socketpair()
        left.settimeout(10)
        cdp = CDP.__new__(CDP)
        cdp.sock, cdp.seq = left, 0
        cdp._buffer, cdp._fragment = b'', bytearray()
        started = time.monotonic()
        def check():
            if time.monotonic() - started >= .15:
                raise IPChanged('changed')
        cdp.interrupt_check = check
        try:
            with self.assertRaises(IPChanged):
                cdp.call('Runtime.evaluate', {}, timeout=10)
            self.assertLess(time.monotonic() - started, .7)
            self.assertEqual(left.gettimeout(), 10)
        finally:
            left.close(); right.close()

    def test_restart_preserves_rows_and_skips_backoff(self):
        app = App.__new__(App)
        app.rows = [{'status': 'REGULAR'}, {'status': ''}]
        before = [dict(row) for row in app.rows]
        app.verification_watch = object()
        app.last_ip_revision = 1
        app.log_diagnostic = Mock(); app.save_outputs = Mock(); app.ui = Mock()
        app.status = SimpleNamespace(config=Mock())
        app.close_consultation_browser = Mock()
        app.ip_monitor = SimpleNamespace(snapshot=lambda: ('203.0.113.2', 3, True), wake=Mock())
        with patch('consulta_cpf_rfb.time.sleep') as sleep:
            app.restart_after_ip_change(IPChanged('changed'))
        sleep.assert_not_called()
        self.assertEqual(app.last_ip_revision, 3)
        self.assertEqual(app.rows, before)
        self.assertIsNone(app.verification_watch)
        app.close_consultation_browser.assert_called_once()
        app.ip_monitor.wake.assert_called_once()

    def test_shutdown_disables_interrupt_before_close(self):
        app = App.__new__(App)
        connection = SimpleNamespace(timeout_provider=object(), interrupt_check=object())
        def call(*args, **kwargs):
            self.assertIsNone(connection.interrupt_check)
            self.assertIsNone(connection.timeout_provider)
        connection.call = call
        app.cdp, app.browser = connection, None
        app.release_browser_connection = Mock()
        app.close_consultation_browser()
        app.release_browser_connection.assert_called_once()

if __name__ == '__main__': unittest.main()
