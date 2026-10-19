import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from consulta_cpf_rfb import App, wait_page, Cancelled

class StartupTests(unittest.TestCase):
    def test_ready_page_has_no_fixed_startup_sleep(self):
        page={'webSocketDebuggerUrl':'ws://test'}
        with patch('consulta_cpf_rfb.get_page',return_value=page) as get, patch('consulta_cpf_rfb.time.sleep') as sleep:
            self.assertIs(wait_page(lambda:True),page)
        get.assert_called_once_with(timeout=.25)
        sleep.assert_not_called()

    def test_page_discovery_retries_until_target_exists(self):
        page={'webSocketDebuggerUrl':'ws://test'}
        with patch('consulta_cpf_rfb.get_page',side_effect=[RuntimeError('not yet'),page]), patch('consulta_cpf_rfb.time.sleep') as sleep:
            self.assertIs(wait_page(lambda:True),page)
        sleep.assert_called_once_with(.05)

    def test_page_discovery_honors_stop(self):
        with self.assertRaises(Cancelled):wait_page(lambda:False)

    def test_fields_ready_while_document_still_loading(self):
        app=App.__new__(App)
        app.cdp=SimpleNamespace(eval=Mock(side_effect=[1,{'epoch':2,'form':True,'ready':False}]),call=Mock(return_value={}))
        app.running=True; app.compact_active=False; app.rotation=None; app.full_reloads=0
        app.captcha_preview=SimpleNamespace(reset=Mock())
        app.log_diagnostic=Mock(); app.check_ip_change=Mock()
        with patch('consulta_cpf_rfb.time.sleep') as sleep:
            app.navigate_home()
        sleep.assert_not_called()
        self.assertIsNotNone(app.form_loaded_at)
        self.assertEqual(app.full_reloads,1)

if __name__=='__main__':unittest.main()
