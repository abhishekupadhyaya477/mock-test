import { useState } from 'react';
import MockSelection from './components/MockSelection';
import ActiveTest from './components/ActiveTest';
import ScoreSummary from './components/ScoreSummary';
import { getMockTests, getMockTestById } from './data/loader';
import { computeTestResult } from './utils/scoring';
import type { UserAnswers, TestResult } from './types/mock';

type View = 'select' | 'test' | 'result';

function App() {
  const mocks = getMockTests();

  const [view, setView] = useState<View>('select');
  const [activeMockId, setActiveMockId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const handleSelectMock = (mockId: string) => {
    setActiveMockId(mockId);
    setTestResult(null);
    setView('test');
  };

  const handleSubmit = (answers: UserAnswers) => {
    const mock = getMockTestById(activeMockId!);
    if (!mock) return;
    setTestResult(computeTestResult(mock, answers));
    setView('result');
  };

  const handleRetake = () => {
    setTestResult(null);
    setView('test');
  };

  const handleBackToMocks = () => {
    setActiveMockId(null);
    setTestResult(null);
    setView('select');
  };

  // --- Render ---
  if (view === 'test' && activeMockId) {
    const mock = getMockTestById(activeMockId);
    if (!mock) return null;
    return (
      <ActiveTest
        key={activeMockId + (testResult ? '-retake' : '')}
        mockTest={mock}
        onSubmit={handleSubmit}
        onBack={handleBackToMocks}
      />
    );
  }

  if (view === 'result' && testResult) {
    return (
      <ScoreSummary
        result={testResult}
        onRetake={handleRetake}
        onBackToMocks={handleBackToMocks}
      />
    );
  }

  return <MockSelection mocks={mocks} onSelect={handleSelectMock} />;
}

export default App;
