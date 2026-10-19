import socket
import sys
import time
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from consulta_cpf_rfb import App, CDP
from wifi_networks import ResponseWatch, SwitchRequired

class ResponseTimeoutTests(unittest.TestCase):
    def app(self, mode='stalled'):
        a=App.__new__(App)
        a.rotation=SimpleNamespace(settings={'mode':mode},due=lambda:False,observe_ip=Mock())
        a.ip_monitor=SimpleNamespace(snapshot=lambda:('203.0.113.1',0,True))
        a.last_ip_revision=0; a.verification_watch=None; a.response_watch=None
        return a

    def test_deadline_starts_on_submission_not_page_or_captcha(self):
        a=self.app();a.cdp=SimpleNamespace(eval=Mock(return_value=True))
        a.check_ip_change()
        self.assertIsNone(a.response_watch)
        with patch('consulta_cpf_rfb.ResponseWatch',return_value=ResponseWatch(now=lambda:100)):
            self.assertTrue(a.click_submit())
        self.assertEqual(a.response_watch.deadline,102)
        a.response_watch.now=lambda:101.999;a.check_ip_change()
        a.response_watch.now=lambda:102
        with self.assertRaises(SwitchRequired):a.check_ip_change()

    def test_missing_submit_button_disarms_deadline(self):
        a=self.app();a.cdp=SimpleNamespace(eval=Mock(return_value=False))
        self.assertFalse(a.click_submit());self.assertIsNone(a.response_watch)

    def test_off_mode_does_not_arm_response_deadline(self):
        a=self.app('off');a.cdp=SimpleNamespace(eval=Mock(return_value=True))
        self.assertTrue(a.click_submit());self.assertIsNone(a.response_watch)

    def test_pending_manual_verification_has_no_response_deadline(self):
        a=self.app();a.verification_watch=SimpleNamespace(expired=lambda:True)
        a.check_ip_change()
        self.assertEqual(a.browser_timeout(),10)

    def test_silent_browser_cannot_extend_two_second_response_deadline(self):
        a=self.app();left,right=socket.socketpair();left.settimeout(10)
        cdp=CDP.__new__(CDP);cdp.sock=left;cdp.seq=0
        cdp._buffer=b'';cdp._fragment=bytearray()
        cdp.timeout_provider=a.browser_timeout;cdp.interrupt_check=a.check_ip_change
        a.response_watch=ResponseWatch()
        started=time.monotonic()
        try:
            with self.assertRaises((SwitchRequired,TimeoutError)):
                cdp.call('Runtime.evaluate',{},timeout=10)
            self.assertLess(time.monotonic()-started,2.4)
            with self.assertRaises(SwitchRequired):a.check_ip_change()
        finally:left.close();right.close()

if __name__=='__main__':unittest.main()
