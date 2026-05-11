"use client";

interface AnalyticsSimpleProps {
  stats: any;
}

export function AnalyticsSimple({ stats }: AnalyticsSimpleProps) {
  const topAgents = stats?.topReliableAgents || [];
  const countryVolume = stats?.volumeByCountry || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
          <p className="text-sm text-slate-600">Demandes / jour</p>
          <p className="text-2xl font-bold text-slate-900">{Math.round((stats?.totalRequests || 0) / 7)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-blue-200 bg-blue-50">
          <p className="text-sm text-blue-700">Conversion demandes vers offres</p>
          <p className="text-2xl font-bold text-blue-900">{stats?.conversionRate ?? 0}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-emerald-200 bg-emerald-50">
          <p className="text-sm text-emerald-700">Taux succes livraison</p>
          <p className="text-2xl font-bold text-emerald-900">{stats?.deliverySuccessRate ?? 0}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-violet-200 bg-violet-50">
          <p className="text-sm text-violet-700">Revenu libere</p>
          <p className="text-2xl font-bold text-violet-900">{Math.floor(stats?.totalRevenue || 0)} DZD</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-base font-semibold text-slate-900">Agents les plus fiables</h3>
          </div>
          {topAgents.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">Aucune donnee agent.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Agent</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Succes</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Litiges</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {topAgents.map((agent: any) => (
                  <tr key={agent.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-800">{agent.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{agent.successRate}%</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{agent.disputesOnAgent}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 font-semibold">{agent.confidenceScore}/100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-base font-semibold text-slate-900">Volume par pays</h3>
          </div>
          {countryVolume.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">Aucune donnee pays.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Pays</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Demandes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {countryVolume.map((item: any) => (
                  <tr key={item.country} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-800">{item.country}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 font-semibold">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

